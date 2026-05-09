# NyayAI — Deployment Requirements

## Stack

| Layer | Technology | Hosting |
|-------|-----------|---------|
| Frontend | React 18 + Vite + TypeScript + MUI v7 | Vercel (free) |
| Backend | Node.js + Express + TypeScript | Render (free) |
| Database | MongoDB | MongoDB Atlas (free M0) |
| PDF Storage | Local disk (backend server) | Render disk (ephemeral) |

---

## Accounts Required

| Service | URL | Free Tier |
|---------|-----|-----------|
| MongoDB Atlas | https://cloud.mongodb.com | 512 MB, shared cluster |
| Render | https://render.com | 750 hrs/month, sleeps after 15 min idle |
| Vercel | https://vercel.com | Unlimited deployments, 100 GB bandwidth |
| GitHub | https://github.com | Required — both platforms deploy from repo |

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `PORT` | Yes | `5000` | Server port |
| `MONGODB_URI` | Yes | `mongodb+srv://user:pass@cluster.mongodb.net/nyayai` | MongoDB Atlas connection string |
| `JWT_SECRET` | Yes | `<64+ random chars>` | Access token signing key |
| `JWT_REFRESH_SECRET` | Yes | `<64+ different random chars>` | Refresh token signing key |
| `JWT_EXPIRES_IN` | Yes | `15m` | Access token lifetime |
| `JWT_REFRESH_EXPIRES_IN` | Yes | `7d` | Refresh token lifetime |
| `SMS_PROVIDER` | Yes | `console` | OTP delivery (`console` = print to logs, no SMS) |
| `CLIENT_URL` | Yes | `https://your-app.vercel.app` | Frontend origin for CORS |

### Frontend (`.env` in project root)

| Variable | Required | Example | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `https://your-api.onrender.com` | Backend base URL |

---

## MongoDB Atlas Setup

1. Sign up at https://cloud.mongodb.com
2. Create a **free M0 cluster** (any region)
3. **Database Access** → Add Database User
   - Authentication: Password
   - Role: Atlas admin (or readWriteAnyDatabase)
   - Save username and password
4. **Network Access** → Add IP Address → `0.0.0.0/0` (allow all)
5. **Connect** → Drivers → copy connection string
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/nyayai
   ```
6. Replace `<username>` and `<password>` with your credentials

**Collections created automatically on first run:**
`users` `otps` `documents` `lawyers` `bookings` `payments` `notifications`

---

## Render (Backend) Setup

1. Sign up at https://render.com → connect GitHub account
2. **New → Web Service** → select repo `apnalegal`
3. Configure:

```
Name:           nyayai-api
Root Directory: backend
Runtime:        Node
Build Command:  npm install && npm run build
Start Command:  npm start
Instance Type:  Free
```

4. Add all backend environment variables (see table above)
5. Click **Create Web Service**
6. After deploy succeeds, open **Shell** tab and run:
   ```bash
   npm run seed
   ```
   This inserts 4 sample lawyers into MongoDB.

7. Note your backend URL: `https://nyayai-api.onrender.com`

**Free tier limitations:**
- Spins down after 15 min of inactivity
- First request after sleep takes ~30 seconds
- 512 MB RAM, shared CPU

---

## Vercel (Frontend) Setup

1. Sign up at https://vercel.com → connect GitHub account
2. **Add New → Project** → import repo `apnalegal`
3. Configure:

```
Framework Preset: Vite
Root Directory:   . (leave blank / default)
Build Command:    npm run build
Output Directory: dist
```

4. Add environment variable:
   ```
   VITE_API_URL = https://nyayai-api.onrender.com
   ```
5. Click **Deploy**
6. Note your frontend URL: `https://apnalegal.vercel.app`

---

## Post-Deploy Steps

### 1. Update CORS on Backend
Go to Render → your service → Environment → update `CLIENT_URL`:
```
CLIENT_URL = https://apnalegal.vercel.app
```
Then **Manual Deploy → Deploy latest commit**.

### 2. Verify Seed Data
Open: `https://nyayai-api.onrender.com/subscription/plans`
Should return JSON with Free/Pro/Business plans.

### 3. Test OTP Login
- Open the frontend URL
- Enter any 10-digit phone number
- Check **Render → Logs** for: `[OTP] +91XXXXXXXXXX → 123456`
- Enter the OTP

---

## CI / CD

Both platforms auto-deploy on every push to `main`:
- **Vercel** — triggers on push, builds frontend, deploys in ~1 min
- **Render** — triggers on push, builds backend, deploys in ~2–3 min

No manual action needed after initial setup.

---

## Node.js Version

| Component | Required Version |
|-----------|-----------------|
| Frontend build | Node 18+ |
| Backend runtime | Node 18+ |

Set in Render under **Environment → Node Version**: `18`

---

## Build Commands Reference

```bash
# Frontend
npm install        # install dependencies
npm run dev        # local dev server → http://localhost:5173
npm run build      # production build → dist/

# Backend
cd backend
npm install        # install dependencies
npm run dev        # local dev with hot-reload → http://localhost:5000
npm run build      # compile TypeScript → dist/
npm start          # run compiled JS (production)
npm run seed       # seed 4 sample lawyers into MongoDB
```

---

## Local Development (2 terminals)

**Terminal 1 — Backend**
```bash
cd backend
cp .env.example .env
# Edit .env — set MONGODB_URI, JWT_SECRET, JWT_REFRESH_SECRET
npm install
npm run seed
npm run dev
# → http://localhost:5000
```

**Terminal 2 — Frontend**
```bash
# In project root
echo "VITE_API_URL=http://localhost:5000" > .env
npm install
npm run dev
# → http://localhost:5173
```

---

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| `CORS error` in browser | `CLIENT_URL` mismatch | Set `CLIENT_URL` on Render to exact Vercel URL, no trailing slash |
| Backend returns 500 on first call | Render cold start | Wait 30 seconds, retry |
| `MongoServerError: connection refused` | Atlas IP not whitelisted | Network Access → allow `0.0.0.0/0` |
| OTP not found | Checking browser console | Check **Render Logs** — OTP prints to server terminal |
| Blank white page on Vercel | Build error or wrong env var | Check Vercel build logs; confirm `VITE_API_URL` has no trailing slash |
| PDFs not persisting after redeploy | Render ephemeral disk | Expected on free tier — upgrade to paid disk or use S3 |
| `Cannot GET /` on frontend | Wrong output directory | Set Output Directory to `dist` in Vercel settings |

---

## Production Checklist

- [ ] MongoDB Atlas cluster created, IP whitelisted, user created
- [ ] `MONGODB_URI` set on Render with correct username/password
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` set to long random strings (64+ chars)
- [ ] `CLIENT_URL` on Render matches Vercel URL exactly
- [ ] `VITE_API_URL` on Vercel matches Render URL exactly
- [ ] `npm run seed` run once after first backend deploy
- [ ] OTP login tested end-to-end (check Render logs for OTP)
- [ ] PDF generation and download tested
- [ ] CORS verified (no browser errors on API calls)
