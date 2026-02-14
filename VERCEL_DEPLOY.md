# Fix Vercel 404 – Checklist

Follow these steps **exactly** so the app deploys instead of 404.

## How API URL works (dev vs prod)

- **Local dev (PC and mobile):** The app uses the **same host as the page** with port **3000**. Ensure the backend is running.
- **Production (Vercel):** By default the app uses `apiUrl` = **`/api`** (same origin). Vercel only serves the frontend, so `/api` returns the app HTML and **login fails**. To fix it, deploy the backend and set the env var below.

**If you see "Cannot reach API" or "Login failed" on the live site** → The frontend has no backend yet. Follow **Enable login on Vercel** below.

## Enable login on Vercel

1. **Deploy the backend** somewhere that gives you a public URL (e.g. [Railway](https://railway.app), [Render](https://render.com), [Fly.io](https://fly.io)). Your API must be at a URL like `https://your-app.railway.app` (with routes like `/api/auth/login`, `/api/projects`, etc.).
2. In **Vercel** → your project → **Settings** → **Environment Variables**:
   - **Name:** `NG_APP_API_URL`
   - **Value:** your backend base URL including `/api`, e.g. `https://your-app.railway.app/api` (no trailing slash after `api`).
   - Apply to **Production** (and Preview if you want).
3. **Redeploy** the Vercel project (Deployments → ⋯ → Redeploy). The build runs `node scripts/write-env.js` and writes this URL into the production build, so login and all API calls will go to your backend.

## Option A: Build from repo root (recommended)

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **General**.
2. **Root Directory**: leave **empty** (do not set `frontend`). Click **Save** if you change it.
3. Go to **Settings** → **Build & Development Settings**.
4. **Framework Preset**: choose **Other** (or leave as is; root `vercel.json` sets `framework: null`).
5. **Build Command**: turn **Override** ON and set:
   ```bash
   cd frontend && npm install && npm run build
   ```
6. **Output Directory**: turn **Override** ON and set:
   ```
   frontend/dist/frontend/browser
   ```
7. **Install Command**: turn **Override** ON and set:
   ```bash
   cd frontend && npm install
   ```
8. Save, then go to **Deployments** → **⋯** on the latest → **Redeploy**.

## Option B: Build from `frontend` folder

1. **Settings** → **General** → **Root Directory**: set to **`frontend`** → Save.
2. **Build & Development Settings**:
   - **Build Command** Override: `npm run build`
   - **Output Directory** Override: `dist/frontend/browser`
3. Save and **Redeploy**.

## After redeploy

- Open the deployment URL. You should see the app (Login page or redirect to it).

## Still having issues?

1. **404 on every route** – Vercel may be using dashboard settings instead of `vercel.json`. Go to **Settings** → **Build & Development Settings** and set **Build Command** and **Output Directory** overrides as in Option A or B above, then **Redeploy**.
2. **Build fails** – Open the deployment → **Building** tab and check the log (e.g. missing `frontend/dist/frontend/browser` means Output Directory is wrong; set it to `frontend/dist/frontend/browser` for Option A).
3. **Blank page or wrong content** – Confirm **Output Directory** is exactly `frontend/dist/frontend/browser` (Option A) or `dist/frontend/browser` (Option B); Angular 18 puts the app in the `browser` subfolder.
