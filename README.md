# NyayAI — AI-Powered Legal Assistant

A mobile-first legal assistant app built with React + Vite (frontend) and Node.js + Express + MongoDB (backend).

---

## Project Structure

```
├── src/                  # Frontend (React + Vite + MUI)
│   ├── app/
│   │   ├── App.tsx
│   │   ├── components/   # All screens
│   │   └── ...
│   └── lib/
│       └── api.ts        # Central API client (all backend calls live here)
├── backend/              # REST API (Node.js + Express + TypeScript)
│   ├── src/
│   │   ├── index.ts      # Entry point
│   │   ├── routes/       # auth, user, documents, lawyers, bookings, payments, subscriptions, notifications
│   │   ├── models/       # Mongoose models
│   │   ├── middleware/   # JWT auth
│   │   └── utils/        # JWT helpers, OTP, PDF generation
│   └── .env.example
├── .env                  # Frontend env (VITE_API_URL)
└── package.json          # Frontend package.json
```

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| MongoDB | Local or Atlas | https://www.mongodb.com/try/download/community |
| npm | comes with Node | — |

---

## Quick Start (2 terminals)

### Terminal 1 — Backend

```bash
cd backend

# 1. Install dependencies
npm install

# 2. Create your .env file
cp .env.example .env
# Edit .env — at minimum set MONGODB_URI (see below)

# 3. Seed the database with 4 sample lawyers
npm run seed

# 4. Start the dev server (hot-reload)
npm run dev
# → Backend running at http://localhost:5000
```

### Terminal 2 — Frontend

```bash
# From the project root

# 1. Install dependencies
npm install

# 2. Create frontend .env
echo "VITE_API_URL=http://localhost:5000" > .env

# 3. Start the dev server
npm run dev
# → Frontend running at http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Backend Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in:

```env
PORT=5000

# MongoDB — choose one:
# Local:
MONGODB_URI=mongodb://localhost:27017/nyayai
# Atlas (replace with your connection string):
# MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/nyayai

# JWT — use long random strings in production
JWT_SECRET=change_me_to_a_long_random_string
JWT_REFRESH_SECRET=change_me_to_another_long_random_string
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OTP — leave as "console" in dev; OTP prints to server terminal
SMS_PROVIDER=console

# Frontend origin (for CORS)
CLIENT_URL=http://localhost:5173
```

> **MongoDB Atlas users:** Create a free cluster at https://cloud.mongodb.com, whitelist your IP, and paste the connection string as `MONGODB_URI`.

---

## First Login (Dev Mode)

Because `SMS_PROVIDER=console`, OTPs are not sent via SMS — they print to the **backend terminal**.

1. Open the app → enter any 10-digit phone number → click **Send OTP**
2. Look at the **backend terminal** for a line like:
   ```
   [OTP] +919876543210 → 482917
   ```
3. Enter that OTP in the app → you're logged in

---

## API Overview

All endpoints are documented inline in `backend/src/routes/`. Base URL: `http://localhost:5000`

| Service | Routes | Auth |
|---------|--------|------|
| Auth | `/auth/send-otp`, `/auth/verify-otp`, `/auth/refresh`, `/auth/logout` | No |
| User | `/user/me`, `/user/stats`, `/user/preferences` | JWT |
| Documents | `/documents`, `/documents/:id/generate`, `/documents/:id/download` | JWT |
| Lawyers | `/lawyers`, `/lawyers/:id`, `/lawyers/:id/availability` | JWT |
| Bookings | `/bookings`, `/bookings/upcoming`, `/bookings/:id/cancel` | JWT |
| Payments | `/payments/pay`, `/payments/history` | JWT |
| Subscriptions | `/subscription/plans` (public), `/subscription/current`, `/subscription/upgrade` | JWT* |
| Notifications | `/notifications`, `/notifications/:id/read`, `/notifications/read-all` | JWT |

> Payments and subscriptions are **dummy** — no real gateway. Payment always succeeds.

---

## Available Scripts

### Frontend (project root)
```bash
npm run dev      # Start dev server
npm run build    # Production build
```

### Backend (`backend/`)
```bash
npm run dev      # Start with hot-reload (ts-node-dev)
npm run build    # Compile TypeScript
npm start        # Run compiled JS
npm run seed     # Seed lawyers collection
```

---

## Tech Stack

**Frontend**
- React 18 + Vite 6 + TypeScript
- Material UI v7
- react-router v7

**Backend**
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT (access 15m + refresh 7d)
- PDFKit (PDF generation)
- Zod (request validation)

---

## Troubleshooting

**`CORS error` in browser**
→ Make sure `CLIENT_URL` in `backend/.env` matches the URL shown by `npm run dev` (e.g. `http://localhost:5173`).

**`MongoServerError: connection refused`**
→ MongoDB is not running. Start it with `brew services start mongodb-community` (Mac) or `sudo systemctl start mongod` (Linux).

**OTP not appearing**
→ Check the **backend terminal**, not the browser. The line looks like `[OTP] +91... → 123456`.

**`Cannot GET /`** on the frontend
→ Make sure you ran `npm install` in the project root (not just in `backend/`).

**Port already in use**
→ Change `PORT` in `backend/.env`. Then update `VITE_API_URL` in the root `.env` to match.
