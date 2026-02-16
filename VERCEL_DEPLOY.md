# Deploy on Vercel – Checklist

Use this guide to deploy the **frontend** to Vercel and fix common issues. The app is intended for **PC** (local dev) and **Vercel** (frontend only).

## How API URL works

- **Local dev (PC):** The app uses **http://localhost:3000/api**. Start the backend with `cd backend && npm start`.
- **Production (Vercel):** Set **NG_APP_API_URL** in Vercel to your backend base URL including `/api` (e.g. `https://your-backend.example.com/api`). If you don’t set it, the live app has no backend and login will fail.

## Enable login on Vercel

1. Host your backend somewhere (e.g. your own server, or any Node host that runs the `backend` folder).
2. In **Vercel** → your project → **Settings** → **Environment Variables**:
   - **Name:** `NG_APP_API_URL`
   - **Value:** your backend base URL including `/api`, e.g. `https://your-backend.example.com/api` (no trailing slash after `api`).
   - Apply to **Production** (and Preview if you want).
3. **Redeploy** (Deployments → ⋯ → Redeploy). The build writes this URL into the production build so login and API calls use your backend.

## "Error creating build plan with Railpack" (build fails)

Set **Root Directory** to **`frontend`** so Vercel treats the app as a standard Angular project:

1. **Settings** → **General** → **Root Directory**: `frontend` → Save.
2. **Build & Development Settings**: **Build Command** = `npm run build`, **Output Directory** = `dist/frontend/browser`.
3. Add env var **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser` (so Vercel serves the static build).
4. Save and **Redeploy**.

## Option B: Build from `frontend` folder (recommended)

1. **Settings** → **General** → **Root Directory**: `frontend` → Save.
2. **Build & Development Settings**: **Build Command** = `npm run build`, **Output Directory** = `dist/frontend/browser`.
3. **Environment Variables**: **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser`.
4. Save and **Redeploy**.

## Option A: Build from repo root

1. **Root Directory**: leave **empty**.
2. **Build Command**: `cd frontend && npm install && npm run build`
3. **Output Directory**: `frontend/dist/frontend/browser`
4. **Install Command**: `cd frontend && npm install`
5. Save and **Redeploy**.

## After redeploy

Open the deployment URL. You should see the app (Login page or redirect). If login fails, set **NG_APP_API_URL** and redeploy.

## Local dev (PC)

- Start backend: `cd backend && npm start`.
- Start frontend: `cd frontend && npm start`.
- Open **http://localhost:4200**. The dev server proxies `/api` to the backend at port 3000.

## Still having issues?

1. **404 on every route** – Set **Build Command** and **Output Directory** as in Option B (or A), then **Redeploy**.
2. **Build fails / Railpack error** – Use **Option B**: Root Directory = `frontend`, Output Directory = `dist/frontend/browser`, then **Redeploy**.
3. **"No start command was found"** – Add **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser`, then **Redeploy**.
4. **Blank page** – Confirm **Output Directory** is exactly `dist/frontend/browser` (Option B) or `frontend/dist/frontend/browser` (Option A).
