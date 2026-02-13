# Fix Vercel 404 – Checklist

Follow these steps **exactly** so the app deploys instead of 404.

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

- Open the deployment URL (e.g. `crud-app-with-auth-filtering.vercel.app`).
- You should see the app (Login page or redirect to it). If you still see 404, check the **Build Logs** for that deployment and fix any build errors.
