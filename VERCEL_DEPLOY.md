# Fix Vercel 404 – Checklist

Follow these steps **exactly** so the app deploys instead of 404.

## How API URL works (dev vs prod)

- **Local dev (PC and mobile):** The app uses the **same host as the page** with port **3000**. Ensure the backend is running.
- **Production (Vercel):** The app uses `environment.apiUrl` = **`/api`**. The repo’s `vercel.json` has **no** `/api` proxy by default, so the app loads and login will fail until you add a backend. When you have a backend URL, add this rewrite **before** the SPA rewrite in `vercel.json`: `{"source": "/api/:path*", "destination": "https://YOUR_ACTUAL_BACKEND_HOST/api/:path*"}` (replace the host). Or set `apiUrl` in `frontend/src/environments/environment.prod.ts` to your full API URL and redeploy.

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
