# NyayAI — Detailed Working Flow Documentation

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Directory Structure](#3-directory-structure)
4. [Frontend Working Flow](#4-frontend-working-flow)
5. [Backend Working Flow](#5-backend-working-flow)
6. [Authentication Flow](#6-authentication-flow)
7. [Feature Flows](#7-feature-flows)
8. [Data Models](#8-data-models)
9. [API Reference](#9-api-reference)
10. [Frontend–Backend Connection](#10-frontendbackend-connection)
11. [Development Setup](#11-development-setup)
12. [Deployment Flow](#12-deployment-flow)
13. [Environment Variables](#13-environment-variables)
14. [Known Limitations](#14-known-limitations)

---

## 1. Project Overview

**NyayAI** is a legal-tech mobile web application that allows Indian users to:

- Generate legal documents (rent agreements, affidavits, legal notices, consumer complaints, FIR help) as downloadable PDFs
- Chat with an AI legal assistant for basic legal guidance
- Browse and book consultations with verified lawyers
- Manage subscriptions (Free / Pro / Business)
- Receive notifications and manage user preferences

**Tech Stack:**

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Material-UI v7, Tailwind CSS, React Router v7 |
| Backend | Node.js, Express 4, TypeScript, MongoDB (Mongoose) |
| Auth | OTP (phone-based), JWT (access + refresh tokens) |
| PDF Generation | PDFKit |
| Deployment | Vercel (frontend) + Render (backend) + MongoDB Atlas |

---

## 2. Architecture

```
┌──────────────────────────────────────────────────────┐
│                  User (Browser)                       │
└──────────────────────┬───────────────────────────────┘
                       │ HTTPS
┌──────────────────────▼───────────────────────────────┐
│          Frontend  (Vite + React 18)                  │
│          Hosted on: Vercel                            │
│          Port (dev): 5173                             │
│                                                       │
│  src/lib/api.ts  ◄──── Centralized API client        │
│  src/app/App.tsx ◄──── Routing + Theme               │
│  src/app/components/ ◄── 16 screen components        │
└──────────────────────┬───────────────────────────────┘
                       │ REST (JSON), JWT Bearer token
┌──────────────────────▼───────────────────────────────┐
│          Backend   (Express + TypeScript)             │
│          Hosted on: Render                            │
│          Port (dev): 5001                             │
│                                                       │
│  src/index.ts     ◄──── Express app, route mounting  │
│  src/routes/      ◄──── 9 route modules              │
│  src/models/      ◄──── 8 Mongoose models            │
│  src/middleware/  ◄──── JWT authentication           │
│  src/utils/       ◄──── JWT, OTP, PDF generation     │
└──────────────────────┬───────────────────────────────┘
                       │ Mongoose ODM
┌──────────────────────▼───────────────────────────────┐
│          MongoDB Atlas (Free M0 Cluster)              │
│          DB: nyayai                                   │
│          Collections auto-created on first write      │
└──────────────────────────────────────────────────────┘
```

---

## 3. Directory Structure

```
Design NyayAI Mobile App/
│
├── src/                            # Frontend source
│   ├── main.tsx                    # React entry point
│   ├── lib/
│   │   └── api.ts                  # All API calls (40+ functions)
│   ├── app/
│   │   ├── App.tsx                 # Routing + MUI theme
│   │   ├── components/             # 16 screen components
│   │   │   ├── SplashScreen.tsx
│   │   │   ├── OnboardingScreens.tsx
│   │   │   ├── AuthScreen.tsx
│   │   │   ├── HomeDashboard.tsx
│   │   │   ├── LegalWorkflow.tsx
│   │   │   ├── DocumentPreview.tsx
│   │   │   ├── DocumentsList.tsx
│   │   │   ├── AIAssistant.tsx
│   │   │   ├── LawyerMarketplace.tsx
│   │   │   ├── LawyerProfile.tsx
│   │   │   ├── ConsultationBooking.tsx
│   │   │   ├── NotificationsScreen.tsx
│   │   │   ├── UserProfile.tsx
│   │   │   ├── EditProfile.tsx
│   │   │   ├── SubscriptionPricing.tsx
│   │   │   ├── SettingsScreen.tsx
│   │   │   └── ui/                 # 50+ reusable UI primitives
│   │   └── figma/                  # Figma-exported assets
│   └── styles/                     # Global CSS / theme files
│
├── backend/                        # Backend source
│   ├── src/
│   │   ├── index.ts                # Express server setup
│   │   ├── routes/
│   │   │   ├── auth.ts             # OTP login, JWT tokens
│   │   │   ├── user.ts             # Profile, stats, preferences
│   │   │   ├── documents.ts        # CRUD + PDF generation
│   │   │   ├── lawyers.ts          # Lawyer listing + reviews
│   │   │   ├── bookings.ts         # Consultation booking
│   │   │   ├── payments.ts         # Dummy payment flow
│   │   │   ├── subscriptions.ts    # Plan management
│   │   │   ├── notifications.ts    # User notifications
│   │   │   └── ai.ts               # AI assistant (keyword matching)
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Lawyer.ts
│   │   │   ├── Document.ts
│   │   │   ├── Booking.ts
│   │   │   ├── Payment.ts
│   │   │   ├── Otp.ts
│   │   │   ├── Notification.ts
│   │   │   └── Review.ts
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT Bearer verification
│   │   ├── utils/
│   │   │   ├── jwt.ts              # Sign/verify access + refresh tokens
│   │   │   ├── otp.ts              # OTP generation + delivery
│   │   │   └── pdf.ts              # PDFKit-based document renderer
│   │   ├── config/
│   │   │   └── db.ts               # MongoDB connection
│   │   └── seed.ts                 # Seed 4 sample lawyers
│   ├── uploads/                    # Generated PDFs stored here (gitignored)
│   ├── .env                        # Backend secrets (gitignored)
│   └── .env.example                # Secrets template
│
├── .env                            # Frontend env: VITE_API_URL
├── package.json                    # Frontend dependencies
├── vite.config.ts                  # Vite + Tailwind + path alias
├── pnpm-workspace.yaml             # Monorepo config
├── README.md                       # Developer setup guide
├── DEPLOYMENT.md                   # Production deployment guide
└── WORKING_FLOW.md                 # This document
```

---

## 4. Frontend Working Flow

### 4.1 App Bootstrap

```
index.html
  └── main.tsx          # React.createRoot → renders <App />
        └── App.tsx     # Reads savedTheme from localStorage
                        # Creates MUI theme (light or dark)
                        # Wraps <BrowserRouter>
                        # Listens for 'darkModeChange' CustomEvent
                        # Defines all routes → renders screen components
```

### 4.2 Route Map

| Path | Component | Auth Required |
|---|---|---|
| `/` | `HomeDashboard` | Yes |
| `/onboarding` | `OnboardingScreens` | No |
| `/auth` | `AuthScreen` | No |
| `/ai-assistant` | `AIAssistant` | Yes |
| `/legal-workflow/:type` | `LegalWorkflow` | Yes |
| `/document/:id` | `DocumentPreview` | Yes |
| `/documents` | `DocumentsList` | Yes |
| `/lawyers` | `LawyerMarketplace` | No (public) |
| `/lawyer/:id` | `LawyerProfile` | No (public) |
| `/booking/:lawyerId` | `ConsultationBooking` | Yes |
| `/notifications` | `NotificationsScreen` | Yes |
| `/profile` | `UserProfile` | Yes |
| `/subscription` | `SubscriptionPricing` | Yes |
| `/settings` | `SettingsScreen` | Yes |
| `/edit-profile` | `EditProfile` | Yes |

### 4.3 API Client (`src/lib/api.ts`)

All backend communication goes through a single centralized module:

```
apiFetch(url, options)
  ├── Reads accessToken from localStorage
  ├── Sets Authorization: Bearer {token} header
  ├── Makes fetch() request
  ├── If response is 401 → tries POST /auth/refresh
  │     ├── Success: stores new accessToken, retries original request
  │     └── Failure: clears all tokens, redirects to /auth
  └── Returns parsed JSON response
```

**Function groups exported:**

| Group | Functions |
|---|---|
| Auth | `sendOtp`, `verifyOtp`, `logout` |
| User | `getMe`, `updateMe`, `getStats`, `getPreferences`, `updatePreferences` |
| Documents | `getDocuments`, `getDrafts`, `createDocument`, `generateDocument`, `deleteDocument`, `downloadDocumentUrl` |
| Lawyers | `getLawyers`, `getLawyer`, `getLawyerAvailability`, `getLawyerReviews`, `submitReview` |
| Bookings | `createBooking`, `getBookings`, `getUpcomingBookings`, `cancelBooking` |
| Payments | `pay`, `getPaymentHistory` |
| Subscriptions | `getPlans`, `getCurrentPlan`, `upgradePlan`, `cancelSubscription` |
| Notifications | `getNotifications`, `markNotificationRead`, `markAllNotificationsRead`, `deleteNotification` |
| AI | `askAI` |

### 4.4 Dark Mode System

1. On app load: read `localStorage.theme` → set MUI theme to `light` or `dark`
2. `SettingsScreen` toggles preference → calls `updatePreferences({ darkMode })` → backend stores it
3. Dispatches `new CustomEvent('darkModeChange', { detail: { darkMode } })`
4. `App.tsx` listens for this event → re-creates MUI theme → React re-renders entire tree

### 4.5 Document Type Routes

`/legal-workflow/:type` handles all 5 document templates:

| `:type` value | Document | Steps |
|---|---|---|
| `rent-agreement` | Rent Agreement | 3 steps (basic details → property info → terms) |
| `affidavit` | Affidavit | Customizable fields |
| `legal-notice` | Legal Notice | Pre-configured form |
| `consumer-complaint` | Consumer Complaint | Pre-configured form |
| `fir-help` | FIR Help | Pre-configured form |

---

## 5. Backend Working Flow

### 5.1 Server Boot Sequence

```
backend/src/index.ts
  1. Load .env variables
  2. Connect to MongoDB (db.ts) — retries on failure
  3. Create Express app
  4. Register global middleware:
     - express.json()
     - CORS (allow CLIENT_URL origin)
  5. Mount route modules:
     - /auth        → auth.ts
     - /user        → user.ts
     - /documents   → documents.ts
     - /lawyers     → lawyers.ts
     - /bookings    → bookings.ts
     - /payments    → payments.ts
     - /subscription → subscriptions.ts
     - /notifications → notifications.ts
     - /ai          → ai.ts
  6. Listen on PORT (default 5001)
```

### 5.2 Authentication Middleware

Every protected route uses the `authenticate` middleware:

```
authenticate(req, res, next)
  1. Extract Bearer token from Authorization header
  2. Call verifyAccessToken(token)  — HS256 HMAC verify with JWT_SECRET
  3. If valid → attach req.userId → call next()
  4. If invalid/expired → return 401 { error: "Invalid token" }
```

### 5.3 PDF Generation Flow

```
POST /documents/:id/generate
  1. Find document by ID + userId (ownership check)
  2. Call generatePdf(formData, type)
     └── PDFKit: create new PDF document
         ├── Add title header
         ├── Iterate formData key-value pairs → render rows
         └── Pipe to fs.WriteStream → backend/uploads/{uuid}.pdf
  3. Update document: { status: 'generated', pdfPath: '/uploads/{uuid}.pdf' }
  4. Create Notification: type='document', title='Document Ready'
  5. Return { document, message: 'PDF generated successfully' }
```

### 5.4 AI Query Flow

```
POST /ai/query  { message: "What is rent agreement?" }
  1. Normalize message to lowercase
  2. Keyword match against hardcoded knowledge base:
     - rent → rent agreement explanation (parties, registration, stamp duty)
     - consumer → Consumer Protection Act 2019 guidance
     - fir → FIR filing steps
     - affidavit → affidavit description
     - legal notice → how to send legal notice
     - bail → bail procedure overview
     - divorce → divorce procedure overview
     - property → property law overview
     - (default) → generic legal guidance response
  3. Return { response: "..." }
```

---

## 6. Authentication Flow

### 6.1 First-Time Login

```
Frontend                          Backend                         MongoDB
   │                                 │                               │
   │── POST /auth/send-otp ─────────►│                               │
   │   { phone: "+91XXXXXXXXXX" }    │                               │
   │                                 │── Find or Create User ───────►│
   │                                 │   { phone, name:"New User" }  │
   │                                 │── Generate 6-digit OTP        │
   │                                 │── Save Otp { phone, otp,     │
   │                                 │     expiresAt: +5min } ──────►│
   │                                 │── console.log("[OTP] +91X → 123456")
   │◄── 200 { message: "OTP sent" } ─│
   │                                 │
   │── POST /auth/verify-otp ───────►│
   │   { phone, otp: "123456" }      │
   │                                 │── Find Otp (not expired) ────►│
   │                                 │── Delete Otp ────────────────►│
   │                                 │── signAccessToken(userId, 15m)│
   │                                 │── signRefreshToken(userId, 7d)│
   │                                 │── Save refreshToken on User ─►│
   │◄── 200 { accessToken,           │
   │          refreshToken, user } ──│
   │                                 │
   │ Store both tokens in localStorage
```

### 6.2 Token Refresh

```
Frontend (api.ts)                 Backend
   │                                 │
   │── Any protected request ───────►│
   │   Authorization: Bearer {expired}│
   │◄── 401 Unauthorized ────────────│
   │                                 │
   │── POST /auth/refresh ──────────►│
   │   { refreshToken }              │
   │                                 │── verifyRefreshToken()
   │                                 │── Issue new accessToken (15m)
   │                                 │── Issue new refreshToken (7d)
   │                                 │── Update User.refreshToken ──►│ (MongoDB)
   │◄── 200 { accessToken,           │
   │          refreshToken } ────────│
   │                                 │
   │ Store new tokens in localStorage
   │── Retry original request ──────►│
```

### 6.3 Logout

```
Frontend                          Backend
   │                                 │
   │── POST /auth/logout ───────────►│
   │   Authorization: Bearer {token} │
   │                                 │── Clear User.refreshToken ───►│ (MongoDB)
   │◄── 200 { message: "Logged out"}─│
   │                                 │
   │ Clear localStorage (accessToken, refreshToken, user)
   │ Navigate to /auth
```

---

## 7. Feature Flows

### 7.1 First-Time User Onboarding

```
App Load
  │
  ▼
SplashScreen (2 second timer)
  │
  ▼
Check localStorage.hasOnboarded
  ├── false → /onboarding (carousel intro)
  │           Set localStorage.hasOnboarded = true
  │           → /auth
  └── true  → Check localStorage.accessToken
                ├── exists → / (HomeDashboard)
                └── missing → /auth
```

### 7.2 Generate a Legal Document

```
/ (HomeDashboard) → Click document type card
  │
  ▼
/legal-workflow/rent-agreement
  │
  ▼
LegalWorkflow Component
  ├── Step 1: Basic Details form (landlord name, tenant name, dates)
  ├── Step 2: Property Info (address, rent amount, deposit)
  └── Step 3: Terms (lock-in, notice period, utilities)
  │
  ▼ Click "Generate PDF"
  │
  POST /documents  { type, title, formData, status: 'draft' }
  │ ← { _id, ... }
  │
  POST /documents/:id/generate
  │ ← { pdfPath, status: 'generated' }
  │
  ▼
/document/:id (DocumentPreview)
  │
  GET /documents/:id/download  → Browser downloads PDF
```

### 7.3 Book a Lawyer Consultation

```
/lawyers (LawyerMarketplace)
  │
  ▼ Filter by specialty / search by name
  GET /lawyers?specialty=Property&search=Sharma
  │
  ▼ Click lawyer card
  │
/lawyer/:id (LawyerProfile)
  │
  GET /lawyers/:id
  GET /lawyers/:id/availability
  GET /lawyers/:id/reviews
  │
  ▼ Click "Book Now"
  │
/booking/:lawyerId (ConsultationBooking)
  │
  Select: date, time slot, type (video ₹2000 / audio ₹1500 / chat ₹1000)
  │
  ▼ Confirm Booking
  POST /bookings  { lawyerId, date, time, type }
  │ ← { booking }
  │
  POST /payments/pay  { bookingId, amount }
  │ ← { transactionId: "TXN-XXXX" }
  │
  Navigate to / with success toast
  Notification created: type='consultation'
```

### 7.4 AI Assistant Query

```
/ai-assistant (AIAssistant)
  │
  User types: "Can I break my rent agreement early?"
  │
  POST /ai/query  { message: "Can I break my rent agreement early?" }
  │
  Backend: keyword match → "rent" → returns rent agreement guidance
  │ ← { response: "Under Indian law, rent agreements..." }
  │
  Display chat bubble with response
```

### 7.5 Notification Flow

**Creation** (automatic, server-side):
- `POST /documents/:id/generate` → creates notification (type: `document`)
- `POST /bookings` → creates notification (type: `consultation`)

**Consumption** (user-initiated):
```
/notifications (NotificationsScreen)
  │
  GET /notifications  → list with unread count
  │
  ▼ Tap notification → PUT /notifications/:id/read
  ▼ Tap "Mark all read" → PUT /notifications/read-all
  ▼ Tap delete icon → DELETE /notifications/:id
```

---

## 8. Data Models

### User
```typescript
{
  _id: ObjectId,
  phone: string (unique, sparse),
  name: string,
  email: string,
  avatar: string,
  refreshToken: string,
  subscription: {
    plan: 'free' | 'pro' | 'business',
    since: Date
  },
  preferences: {
    darkMode: boolean,
    language: string,
    notifications: boolean,
    emailNotifications: boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Lawyer
```typescript
{
  _id: ObjectId,
  name: string,
  specialty: string,          // 'Property Law', 'Consumer Rights', 'Family Law', 'Criminal Law'
  experience: number,         // years
  rating: number,             // 1–5
  reviewCount: number,
  availability: string,       // e.g., 'Mon–Fri, 9 AM – 6 PM'
  pricePerHour: number,       // ₹ per hour
  verified: boolean,
  city: string,
  bio: string,
  availableSlots: [{ date: string, times: string[] }]   // next 5 days
}
```

### Document
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: 'rent-agreement' | 'affidavit' | 'legal-notice' | 'consumer-complaint' | 'fir-help',
  title: string,
  formData: object,           // all form fields
  status: 'draft' | 'generated',
  pdfPath: string,            // local path: backend/uploads/{uuid}.pdf
  createdAt: Date,
  updatedAt: Date
}
```

### Booking
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  lawyerId: ObjectId (ref: Lawyer),
  date: string,
  time: string,
  type: 'video' | 'audio' | 'chat',
  status: 'pending' | 'confirmed' | 'cancelled',
  amount: number,             // ₹2000 / ₹1500 / ₹1000
  paymentId: ObjectId (ref: Payment),
  createdAt: Date
}
```

### Notification
```typescript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  type: 'document' | 'consultation' | 'reminder' | 'system',
  title: string,
  message: string,
  read: boolean,
  createdAt: Date
}
```

### Otp (ephemeral)
```typescript
{
  _id: ObjectId,
  phone: string,
  otp: string (6 digits),
  expiresAt: Date             // now + 5 minutes
}
```

---

## 9. API Reference

### Auth Routes (no JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/auth/send-otp` | `{ phone }` | `{ message }` |
| POST | `/auth/verify-otp` | `{ phone, otp }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/google` | `{ googleToken }` | `{ accessToken, refreshToken, user }` |
| POST | `/auth/refresh` | `{ refreshToken }` | `{ accessToken, refreshToken }` |
| POST | `/auth/logout` | — (JWT) | `{ message }` |

### User Routes (JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/user/me` | — | `{ user }` |
| PUT | `/user/me` | `{ name, email, avatar }` | `{ user }` |
| GET | `/user/stats` | — | `{ documentCount, draftCount, bookingCount }` |
| GET | `/user/preferences` | — | `{ preferences }` |
| PUT | `/user/preferences` | `{ darkMode, language, notifications }` | `{ preferences }` |

### Document Routes (JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/documents` | — | `[documents]` |
| POST | `/documents` | `{ type, title, formData, status }` | `{ document }` |
| GET | `/documents/:id` | — | `{ document }` |
| PUT | `/documents/:id` | `{ formData, status }` | `{ document }` |
| DELETE | `/documents/:id` | — | `{ message }` |
| POST | `/documents/:id/generate` | — | `{ document, message }` |
| GET | `/documents/:id/download` | — | PDF file stream |

### Lawyer Routes

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/lawyers` | No | `[lawyers]` (filter: `?specialty=`, `?search=`) |
| GET | `/lawyers/:id` | No | `{ lawyer }` |
| GET | `/lawyers/:id/availability` | No | `{ availableSlots }` |
| GET | `/lawyers/:id/reviews` | No | `[reviews]` |
| POST | `/lawyers/:id/review` | JWT | `{ review }` |

### Booking Routes (JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| GET | `/bookings` | — | `[bookings]` |
| POST | `/bookings` | `{ lawyerId, date, time, type }` | `{ booking }` |
| GET | `/bookings/upcoming` | — | `[bookings]` |
| POST | `/bookings/:id/cancel` | — | `{ booking }` |

### Payment Routes (JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/payments/pay` | `{ bookingId, amount }` | `{ transactionId, status: 'success' }` |
| GET | `/payments/history` | — | `[payments]` |

### Subscription Routes

| Method | Endpoint | Auth | Response |
|---|---|---|---|
| GET | `/subscription/plans` | No | `[{ plan, price, features }]` |
| GET | `/subscription/current` | JWT | `{ subscription }` |
| POST | `/subscription/upgrade` | JWT | `{ subscription }` |

### Notification Routes (JWT required)

| Method | Endpoint | Response |
|---|---|---|
| GET | `/notifications` | `[notifications]` |
| PUT | `/notifications/:id/read` | `{ notification }` |
| PUT | `/notifications/read-all` | `{ message }` |
| DELETE | `/notifications/:id` | `{ message }` |

### AI Route (JWT required)

| Method | Endpoint | Body | Response |
|---|---|---|---|
| POST | `/ai/query` | `{ message }` | `{ response }` |

---

## 10. Frontend–Backend Connection

### How Requests Are Made

All API calls originate from `src/lib/api.ts`. The base URL is configured via environment variable:

- **Development**: `VITE_API_URL=http://localhost:5001`
- **Production**: `VITE_API_URL=https://nyayai-api.onrender.com`

Vite exposes it as `import.meta.env.VITE_API_URL`.

### CORS

The backend only allows requests from the frontend origin:

```
backend/.env → CLIENT_URL=http://localhost:5173   (dev)
backend/.env → CLIENT_URL=https://your-app.vercel.app  (prod)
```

Any frontend origin not matching `CLIENT_URL` will be rejected by the browser pre-flight check.

### JWT Token Lifecycle

```
accessToken:   15 minutes   → stored in localStorage.accessToken
refreshToken:  7 days        → stored in localStorage.refreshToken
               also saved to User.refreshToken in MongoDB (for server-side revocation)
```

On logout, the server clears `User.refreshToken`, invalidating any stolen refresh tokens.

---

## 11. Development Setup

### Prerequisites

- Node.js 18+
- MongoDB (local) or MongoDB Atlas account
- pnpm (optional — npm works too)

### Step 1 — Backend

```bash
cd backend
cp .env.example .env
# Edit .env and set MONGODB_URI to your local or Atlas connection string
npm install
npm run seed          # One-time: seeds 4 sample lawyers
npm run dev           # Starts on http://localhost:5001
```

Watch the terminal for OTP codes when testing login — they are console-logged:
```
[OTP] +91XXXXXXXXXX → 123456
```

### Step 2 — Frontend

```bash
# In project root
echo "VITE_API_URL=http://localhost:5001" > .env
npm install
npm run dev           # Starts on http://localhost:5173
```

Open `http://localhost:5173` in a browser. Use any Indian phone number to log in (OTP appears in backend terminal).

### Step 3 — Seed Data

After running `npm run seed` in the backend, these sample lawyers are available:

| Name | Specialty | Rating | Price |
|---|---|---|---|
| Priya Sharma | Property Law | 4.8 | ₹2500/hr |
| Rajesh Kumar | Consumer Rights | 4.6 | ₹2000/hr |
| Meera Patel | Family Law | 4.9 | ₹3000/hr |
| Ankit Verma | Criminal Law | 4.7 | ₹1500/hr |

---

## 12. Deployment Flow

### Frontend → Vercel

1. Push code to GitHub `main` branch
2. Vercel auto-detects Vite, runs `npm run build`
3. Outputs to `dist/` directory
4. Set environment variable: `VITE_API_URL = https://nyayai-api.onrender.com`

### Backend → Render

1. Push code to GitHub `main` branch
2. Render detects changes in `backend/` directory
3. Runs: `npm install && npm run build` → `npm start`
4. Required environment variables:

```
PORT=5001
MONGODB_URI=mongodb+srv://...
JWT_SECRET=<64-char-random-string>
JWT_REFRESH_SECRET=<64-char-random-string>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
CLIENT_URL=https://your-app.vercel.app
SMS_PROVIDER=console
```

5. After first deploy, run `npm run seed` in Render shell

### Database → MongoDB Atlas

1. Create free M0 cluster
2. Create database user + password
3. Set IP whitelist: `0.0.0.0/0` (or specific Render IPs)
4. Get connection string: `mongodb+srv://user:pass@cluster.mongodb.net/nyayai`
5. Set as `MONGODB_URI` on Render

### Auto-Deploy Triggers

| Action | Triggers |
|---|---|
| Push to `main` | Vercel builds frontend + Render builds backend |
| No action needed | MongoDB Atlas is always running |

---

## 13. Environment Variables

### Frontend (`.env` in project root)

| Variable | Example | Purpose |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5001` | Backend API base URL |

### Backend (`backend/.env`)

| Variable | Example | Purpose |
|---|---|---|
| `PORT` | `5001` | Express server port |
| `MONGODB_URI` | `mongodb://localhost:27017/nyayai_test` | MongoDB connection string |
| `JWT_SECRET` | `test_secret_key...` | Access token signing secret |
| `JWT_REFRESH_SECRET` | `test_refresh_secret...` | Refresh token signing secret |
| `JWT_EXPIRES_IN` | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | Refresh token lifetime |
| `SMS_PROVIDER` | `console` | OTP delivery: `console` (dev) or `msg91` |
| `CLIENT_URL` | `http://localhost:5173` | Frontend origin for CORS |

---

## 14. Known Limitations

| Area | Limitation | Impact |
|---|---|---|
| **PDF Storage** | Saved to local disk (`backend/uploads/`) | Files lost on Render free-tier restart. Use Render persistent disk or S3 for production. |
| **OTP Delivery** | Logged to console; SMS not wired up | Users must check server terminal in dev. Configure MSG91 for production. |
| **AI Assistant** | Hardcoded keyword-based responses | Not using an LLM; answers are static. Claude API or OpenAI integration needed for real AI. |
| **Payments** | Dummy flow — always succeeds | No real payment gateway. Razorpay / Stripe integration needed for live payments. |
| **Subscription Enforcement** | Plan limits not enforced in API | Any user can generate unlimited documents regardless of plan tier. |
| **OTP Console** | Available only in backend logs | In production on Render, check Logs tab to find OTP values. |
| **Lawyer Availability** | Static slots (fixed 7 slots/day) | No real calendar integration; slots don't get blocked after booking. |
| **Backend Cold Start** | Render free tier sleeps after 15 min inactivity | First request after idle takes ~30 seconds. |

---

*Last updated: 2026-05-09*
