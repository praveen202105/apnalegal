# Document Request Flow

> A consumer asks for a legal document → an admin assigns a city-matched lawyer → the lawyer prepares and uploads a PDF → the consumer reviews, e-signs, and downloads the final stamped copy. Every transition is audit-logged and notifies the relevant parties.

This is a separate pipeline from the **self-generate Documents** flow ([`/documents`](backend/src/routes/documents.ts)), which is templated PDFKit output with no human in the loop. The Document Request pipeline is built around `DocumentRequest` and lives at:

- Backend: [`backend/src/routes/documentRequests.ts`](backend/src/routes/documentRequests.ts)
- Model: [`backend/src/models/DocumentRequest.ts`](backend/src/models/DocumentRequest.ts)
- Sign helper: [`backend/src/utils/signPdf.ts`](backend/src/utils/signPdf.ts)
- Consumer SPA: [`src/app/components/RequestDocument.tsx`](src/app/components/RequestDocument.tsx), [`MyDocumentRequests.tsx`](src/app/components/MyDocumentRequests.tsx), [`ReviewAndSign.tsx`](src/app/components/ReviewAndSign.tsx)
- Admin: [`admin-dashboard/src/pages/DocumentRequestQueue.tsx`](admin-dashboard/src/pages/DocumentRequestQueue.tsx)
- Lawyer: [`lawyer-portal/src/pages/DocumentRequests.tsx`](lawyer-portal/src/pages/DocumentRequests.tsx)

---

## 1. Status State Machine

```
                                    ┌──────────────┐
                                    │  cancelled   │ ← terminal (user/admin)
                                    └──────────────┘
                                            ▲
                                            │ POST /:id/cancel
                                            │
  ┌───────────┐    (admin opens)    ┌──────────────┐    POST /admin/.../assign      ┌────────────┐
  │ submitted │ ───────────────────►│ under_review │ ───────────────────────────────►│  assigned  │
  └─────┬─────┘                     └──────────────┘                                  └─────┬──────┘
        │ (admin can also assign directly                                                   │
        │  without going through under_review)                                              │ PATCH /lawyer/.../accept
        │ ─────────────────────────────────────────────────────────────────────────────────►│
                                                                                            ▼
                                                                                     ┌──────────────┐
                                                                                     │ in_progress  │
                                                                                     └──────┬───────┘
                                                                                            │ POST /lawyer/.../deliver (multipart PDF)
                                                                                            ▼
                                                                                     ┌──────────────┐
                                                                                     │  delivered   │
                                                                                     └──────┬───────┘
                                                                                            │ POST /:id/sign (canvas PNG)
                                                                                            ▼
                                                                                     ┌──────────────┐
                                                                                     │    signed    │
                                                                                     └──────┬───────┘
                                                                                            │ system auto-append
                                                                                            ▼
                                                                                     ┌──────────────┐
                                                                                     │  completed   │ ← terminal
                                                                                     └──────────────┘
```

| Status | Set by | Trigger |
|---|---|---|
| `submitted` | user | `POST /document-requests` |
| `under_review` | admin | `PATCH /admin/document-requests/:id/status` (optional) |
| `assigned` | admin | `POST /admin/document-requests/:id/assign` |
| `in_progress` | lawyer | `PATCH /lawyer/document-requests/:id/accept` |
| `delivered` | lawyer | `POST /lawyer/document-requests/:id/deliver` (multipart) |
| `signed` | user | `POST /document-requests/:id/sign` |
| `completed` | system | auto-appended right after `signed` |
| `cancelled` | user/admin | `POST /document-requests/:id/cancel` or admin status PATCH |

Every transition appends to `statusHistory[]` (`{ status, by, byRole, at, note }`) so the UI can show a timeline and audit trail.

---

## 2. End-to-End Sequence

```
Consumer (SPA)              Backend                MongoDB         Admin (SPA)        Lawyer (SPA)
─────────────────────────────────────────────────────────────────────────────────────────────────
POST /document-requests ──► validate (Zod) ──► insert DR
                            statusHistory += submitted
◄──────────────── 201 with new DR

                                                                  GET /admin/document-requests
                                                                  ◄──── list with userId populated

                                                                  POST /admin/.../assign
                                                                  { lawyerId, adminNotes? }
                            check lawyer exists
                            check status not terminal
                            DR.lawyerId = lawyerId
                            DR.contactRevealedAt = now
                            statusHistory += assigned
                            Lawyer.totalCases += 1
                            Notification → lawyer.userId
                            Notification → DR.userId
                                                                  ◄──── 200

                                                                                     GET /lawyer/document-requests
                                                                                     ◄──── list (only mine)

                                                                                     PATCH /lawyer/.../accept
                            DR.status === 'assigned' guard
                            statusHistory += in_progress
                            Notification → DR.userId
                                                                                     ◄──── 200

                                                                                     POST /lawyer/.../deliver
                                                                                     multipart: file=*.pdf,
                                                                                                lawyerNotes
                            multer (memory, 10MB, PDF only)
                            DR.deliverable = { buffer, ... }
                            statusHistory += delivered
                            Notification → DR.userId
                                                                                     ◄──── 200

GET /document-requests/:id
◄──── DR with deliverable metadata (no buffer)
GET /document-requests/:id/deliverable
◄──── application/pdf binary

POST /document-requests/:id/sign
{ pngBase64 }
                            DR.status === 'delivered' guard
                            stampSignatureOnPdf(deliverable.buffer, png, name)
                              → embeds PNG on last page (lower-right)
                              → adds "Signed by: …" + date text
                            DR.signedFile.buffer = stamped
                            DR.signature = { pngBase64, signedAt, ip }
                            DR.signatureMethod = 'canvas'
                            statusHistory += signed
                            statusHistory += completed (system)
                            Notification → lawyer.userId
◄──── 200

GET /document-requests/:id/signed
◄──── final stamped PDF
```

---

## 3. Data Model

[`backend/src/models/DocumentRequest.ts`](backend/src/models/DocumentRequest.ts)

```ts
DocumentRequest {
  userId:        ObjectId  → User                 // required, indexed
  lawyerId?:     ObjectId  → Lawyer               // set on assign, indexed

  // What the user is asking for
  type:          string                            // 'rent-agreement' | 'affidavit' | 'will' | 'legal-notice' | 'consumer-complaint' | 'fir-help' | 'custom'
  title:         string                            // defaults to label of type
  description:   string                            // free-text needs
  formData:      Mixed                             // optional structured fields per type (validated by TYPE_SCHEMAS)
  city:          string                            // required, indexed (used by lawyer matching)
  state:         string
  preferredLanguage: string                        // default 'English'

  // Lifecycle
  status:        enum                              // see state machine, indexed, default 'submitted'
  statusHistory: [{ status, by?, byRole, at, note? }]
  adminNotes:    string
  contactRevealedAt?: Date                         // when admin assigned a lawyer

  // Lawyer's deliverable (single-shot for now)
  deliverable?: {
    buffer:      Buffer                            // raw PDF stored in Mongo
    mimeType:    string                            // 'application/pdf'
    fileName:    string                            // original upload name
    uploadedAt:  Date
    lawyerNotes: string                            // notes shown to client
  }
  versionNumber: number                            // future-proofing for multi-round revisions

  // Signature
  signatureMethod: 'canvas' | 'aadhaar_esign' | null   // future-proofed
  signature?: { pngBase64, signedAt, ip }
  signedFile?: { buffer, mimeType }                // deliverable + signature stamped on last page

  createdAt, updatedAt
}
```

The `Lawyer` model ([`backend/src/models/Lawyer.ts`](backend/src/models/Lawyer.ts)) is matched by `city` and `specialties` on the assign dialog using the existing `GET /admin/lawyers/suggest?city=&category=` endpoint.

`Notification` records ([`backend/src/models/Notification.ts`](backend/src/models/Notification.ts)) are written on every meaningful transition with `type: 'document'`.

---

## 4. API Reference

All routes are mounted in [`backend/src/index.ts`](backend/src/index.ts). All require `Authorization: Bearer <accessToken>` unless stated.

### User-facing — `/document-requests` (role: `user`)

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| POST | `/document-requests` | `{ type, title?, description, formData?, city, state?, preferredLanguage? }` | 201 + DR |
| GET | `/document-requests` | — | 200 + DR[] (mine, no buffers) |
| GET | `/document-requests/:id` | — | 200 + DR (lawyer populated if assigned) |
| GET | `/document-requests/:id/deliverable` | `?token=` accepted in query | 200 + `application/pdf` binary (only after `delivered`) |
| POST | `/document-requests/:id/sign` | `{ pngBase64 }` (data-URI accepted) | 200 + DR (status `completed`) |
| GET | `/document-requests/:id/signed` | — | 200 + signed PDF (only after `signed`) |
| POST | `/document-requests/:id/cancel` | — | 200 + DR (status `cancelled`) |

### Admin-facing — `/admin/document-requests` (role: `admin`)

| Method | Path | Body / Query | Returns |
|---|---|---|---|
| GET | `/admin/document-requests` | `?status=&city=&q=` | 200 + DR[] (all users, populated) |
| GET | `/admin/document-requests/:id` | — | 200 + DR full detail |
| POST | `/admin/document-requests/:id/assign` | `{ lawyerId, adminNotes? }` | 200 + DR. Sets `contactRevealedAt`, increments `Lawyer.totalCases`, fires 2 notifications. |
| PATCH | `/admin/document-requests/:id/status` | `{ status: 'under_review'\|'cancelled', note? }` | 200 + DR |
| GET | `/admin/document-requests/:id/deliverable` | — | 200 + PDF |
| GET | `/admin/document-requests/:id/signed` | — | 200 + PDF |

### Lawyer-facing — `/lawyer/document-requests` (role: `lawyer`)

| Method | Path | Body | Returns |
|---|---|---|---|
| GET | `/lawyer/document-requests` | — | 200 + DR[] (only mine) |
| GET | `/lawyer/document-requests/:id` | — | 200 + DR (mine only) |
| PATCH | `/lawyer/document-requests/:id/accept` | — | 200 + DR (status `in_progress`). Requires status `assigned`. |
| POST | `/lawyer/document-requests/:id/deliver` | `multipart/form-data` with `file` (PDF, ≤10MB) + `lawyerNotes` | 200 + DR. Requires status `assigned` or `in_progress`. |

### Error responses

| Code | When |
|---|---|
| 400 | Invalid Zod payload, missing PDF, non-PDF mime type |
| 401 | Missing/invalid access token |
| 403 | Wrong role |
| 404 | Not found / not yours |
| 409 | Status guard violation (e.g. signing on `completed`, accepting on `delivered`) |

---

## 5. UI Surface

### Consumer SPA ([`src/`](src/))

| Route | Component | Purpose |
|---|---|---|
| `/document-requests/new` | [`RequestDocument.tsx`](src/app/components/RequestDocument.tsx) | Form: type picker, title, description, city, state, language. POSTs and routes to detail. |
| `/document-requests` | [`MyDocumentRequests.tsx`](src/app/components/MyDocumentRequests.tsx) | List of all my requests with status chips and a FAB for new. |
| `/document-requests/:id` | [`ReviewAndSign.tsx`](src/app/components/ReviewAndSign.tsx) | Status timeline, lawyer info, deliverable download, canvas signature pad, signed-copy download. |

The home dashboard ([`HomeDashboard.tsx`](src/app/components/HomeDashboard.tsx)) has a purple **"Lawyer-Prepared Document"** CTA card and a **"My Document Requests"** section showing the latest 3.

### Admin dashboard ([`admin-dashboard/`](admin-dashboard/))

`/document-requests` route → [`DocumentRequestQueue.tsx`](admin-dashboard/src/pages/DocumentRequestQueue.tsx). Tabs by status (New / Assigned / In Progress / Delivered / Completed / All). Each card has an "Assign Lawyer" button that opens a dialog with a city/type-matched lawyer dropdown (auto-populated via [`/admin/lawyers/suggest`](backend/src/routes/admin.ts)). Once delivered/signed, the admin can download both the draft and signed PDFs from the same row.

Sidebar entry added in [`AdminLayout.tsx`](admin-dashboard/src/components/AdminLayout.tsx).

### Lawyer portal ([`lawyer-portal/`](lawyer-portal/))

`/document-cases` route → [`DocumentRequests.tsx`](lawyer-portal/src/pages/DocumentRequests.tsx). Lists assigned cases with **Accept Case** and **Upload Deliverable** actions. The upload dialog is a file input restricted to PDFs plus a notes textarea, posted as `multipart/form-data`.

Sidebar entry added in [`LawyerLayout.tsx`](lawyer-portal/src/components/LawyerLayout.tsx).

---

## 6. File Handling

- **Upload**: [multer](https://www.npmjs.com/package/multer) with `memoryStorage`, 10 MB limit, `application/pdf`-only mime filter.
- **Storage**: `req.file.buffer` is written directly into `DocumentRequest.deliverable.buffer` (matches the existing pdfBuffer-in-Mongo pattern from the self-generate flow). No external file storage; no Cloudinary call in this flow.
- **Delivery**: download endpoints stream the buffer with `Content-Type: application/pdf` and `Content-Disposition` set; admin/lawyer/user variants share the same approach.
- **Error handling**: a route-local middleware (`handleUploadErrors` in [`documentRequests.ts`](backend/src/routes/documentRequests.ts)) converts multer errors (file too large, wrong mime) into clean 400 responses instead of letting them propagate to the global 500 handler.

---

## 7. E-Signature Flow

1. The consumer draws a signature in [`ReviewAndSign.tsx`](src/app/components/ReviewAndSign.tsx) using [`react-signature-canvas`](https://www.npmjs.com/package/react-signature-canvas).
2. The canvas is exported as a PNG `data:` URI (`canvas.toDataURL('image/png')`) and POSTed to `/document-requests/:id/sign`.
3. Server-side, [`stampSignatureOnPdf`](backend/src/utils/signPdf.ts) loads `deliverable.buffer` with [`pdf-lib`](https://pdf-lib.js.org/), embeds the PNG on the last page (lower-right at fixed coordinates), and adds two small text lines: `Signed by: <name>` and `Date: <YYYY-MM-DD>`. The output buffer is saved as `signedFile.buffer`.
4. `signature.pngBase64` is also stored on the DR (kept for audit; not surfaced to anyone but admin via direct DB read).
5. `signedFile` is the canonical artifact for everything downstream — `GET /document-requests/:id/signed` streams it back.

> The current `signatureMethod` is `'canvas'`. The schema also accepts `'aadhaar_esign'` so a future Digio / Leegality / NSDL-eSign integration can plug in a new `/sign-aadhaar` endpoint without a migration.

---

## 8. Notifications

Each side gets the right notifications without the other side polling:

| Trigger | Recipient | Type | Title |
|---|---|---|---|
| Admin assigns lawyer | Lawyer (via `lawyer.userId`) | `document` | "New document case assigned" |
| Admin assigns lawyer | Consumer | `document` | "Lawyer assigned" |
| Lawyer accepts | Consumer | `document` | "Lawyer accepted" |
| Lawyer delivers | Consumer | `document` | "Document ready" |
| Consumer signs | Lawyer | `document` | "Document signed" |

Notifications are read via `GET /notifications` and surfaced in the consumer's `NotificationsScreen`. The same fix was also applied to consultation-assign for consistency ([`backend/src/routes/admin.ts`](backend/src/routes/admin.ts)).

---

## 9. Authorization Model

| Endpoint group | Guard |
|---|---|
| `/document-requests/*` | `authenticate` + `requireRole('user')` |
| `/admin/document-requests/*` | `authenticate` + `requireRole('admin')` |
| `/lawyer/document-requests/*` | `authenticate` + `requireRole('lawyer')` |

Lawyers can only see DRs where `lawyerId` matches their own `Lawyer._id` (not just their userId — the chain is `User._id` → `Lawyer.userId` → `DR.lawyerId === Lawyer._id`). Cross-lawyer access returns 404, not 403, so existence isn't leaked.

Consumer sees the lawyer's contact info **only** after `contactRevealedAt` is set (i.e. after admin assigns).

`/auth/register` is locked to `role: 'user'` only — admin and lawyer accounts must come from `seed-auth.ts` or the admin-only `/admin/lawyers` endpoint.

---

## 10. Validation

[`backend/src/utils/documentSchemas.ts`](backend/src/utils/documentSchemas.ts) holds:

- `DOCTYPE_LABELS` — the human-readable label for each `type` (used to default `title` if the user doesn't provide one).
- `DOCUMENT_SCHEMAS` — Zod schemas for type-specific `formData` (currently only `rent-agreement` is structured; others accept free-form `formData` and rely on `description`).

Both `documents.ts` (self-generate) and `documentRequests.ts` (this flow) import from this single source so validation stays consistent.

---

## 11. Local Development

```bash
# Backend (port 5001)
cd backend
npm install
npm run seed:auth          # seed admin + 3 lawyers (one per city)
npm run dev

# Consumer SPA (port 5173)
npm run dev                # from repo root

# Admin dashboard (port 5174 by default — check vite config)
cd admin-dashboard && npm run dev

# Lawyer portal (port 5175)
cd lawyer-portal && npm run dev
```

Required env vars in `backend/.env`:

| Var | Notes |
|---|---|
| `MONGODB_URI` | Atlas / local Mongo URI |
| `JWT_SECRET` | ≥16 chars; backend refuses to boot if shorter or unset |
| `JWT_REFRESH_SECRET` | ≥16 chars; same |
| `JWT_EXPIRES_IN` | default `15m` |
| `JWT_REFRESH_EXPIRES_IN` | default `7d` |
| `CLIENT_URL` | comma-separated allowed origins |
| `SMS_PROVIDER` | `twilio` or `console` (logs OTPs to stdout for dev) |
| `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_VERIFY_SERVICE_SID` | only if `SMS_PROVIDER=twilio` |

---

## 12. Smoke Test

Confirm the full pipeline works against a separate test database (`nyayai_test`) before shipping changes that touch this flow:

1. Seed: admin via `npm run seed:auth`, lawyer profile in target city.
2. **User**: register via OTP (or `/auth/register`), then `POST /document-requests { type:'rent-agreement', description:'...', city:'Mumbai' }`.
3. **Admin**: `GET /admin/document-requests?status=submitted` → `POST /admin/document-requests/:id/assign { lawyerId }`.
4. **Lawyer**: `PATCH /lawyer/document-requests/:id/accept` → `POST /lawyer/document-requests/:id/deliver` (multipart with a small PDF + lawyerNotes).
5. **User**: `GET /document-requests/:id/deliverable` → confirm PDF → `POST /document-requests/:id/sign { pngBase64 }` (1×1 base64 PNG works for tests) → `GET /document-requests/:id/signed`.
6. Verify: signed PDF size > deliverable size (signature stamped); `statusHistory` array has the expected sequence; 3 user notifications were created.

Negative cases that must hold:
- Non-PDF upload → 400, body `{ message: "Only PDF files are allowed" }`.
- Re-sign on `completed` → 409.
- Lawyer A trying to read Lawyer B's DR → 404.
- Unauthenticated → 401.
- Missing `city` on submit → 400 (Zod errors).

---

## 13. Future Extensions

These are designed-in but not yet built. The schema accommodates each without a migration.

| Extension | Hook |
|---|---|
| **Aadhaar eSign** (Digio / Leegality / NSDL) | `signatureMethod: 'aadhaar_esign'`, new `/sign-aadhaar` endpoint that webhooks back with a provider-issued signed PDF stored in `signedFile`. Legally binding under IT Act §3A; canvas signatures aren't. |
| **Multi-round revisions** | `versionNumber` is already on the model; promote `deliverable` to `deliverables: [Deliverable]` and let the user request changes (state `lawyer_review`). |
| **Read receipts** | Add `userViewedDeliverableAt: Date` and stamp it on `GET /:id/deliverable` so the queue can surface "client opened" / "client hasn't opened in 3 days". |
| **WhatsApp delivery alerts** | Twilio is already provisioned. Send a WA message on `assigned`, `delivered`, `completed`. Higher open rate than in-app. |
| **DigiLocker KYC pull** | Allow user to attach Aadhaar/PAN from DigiLocker on submit. |
| **DRAFT watermark** | `pdf-lib` overlay on the deliverable until `signed`, removed on the signed copy. Visual cue that the document isn't yet executed. |
| **SLA timers** | Lawyer must accept within X hours, deliver within Y days. Surface overdue items in the admin queue. Cheap to add — read `statusHistory[].at`. |
| **Saved signature** | `User.savedSignaturePng` so a returning user can one-click sign on future requests. |
| **Audit log collection** | Move `statusHistory` into a separate immutable `AuditLog` collection once volumes warrant it. |

---

## 14. Operational Notes

- **No new env vars** vs. the prior backend — the feature reuses the existing JWT and Mongo config.
- **No external file storage** — PDFs live in Mongo as Buffers. Watch document count and average size; if mean deliverable size drifts past a few MB or the collection size grows quickly, move uploads to S3/R2 and store URLs only.
- **Mongo indexes**: `userId`, `lawyerId`, `city`, `status` are all indexed on `DocumentRequest` for the queue and lawyer-list queries.
- **Buffers are stripped on list endpoints** via `select('-deliverable.buffer -signedFile.buffer')` so list responses stay small. Only the dedicated download endpoints stream them.
