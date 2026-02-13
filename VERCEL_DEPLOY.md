# Fix Vercel 404 – Checklist

Follow these steps **exactly** so the app deploys instead of 404.

## How API URL works (dev vs prod)

- **Local dev (PC and mobile):** The app uses the **same host as the page** with port **3000** (e.g. `http://localhost:3000/api` on PC, `http://<your-IP>:3000/api` on mobile). No proxy needed; ensure the backend is running and reachable.
- **Production (Vercel):** The app uses `environment.apiUrl`, which is **`/api`**. So the frontend calls your Vercel domain at `/api/...`. For that to work you must either:
  1. **Proxy to your backend** – In root `vercel.json`, the first rewrite sends `/api/:path*` to your backend. **Replace `YOUR_BACKEND_URL`** with your real API base (e.g. `https://your-app.railway.app` or `https://your-api.onrender.com`), then redeploy. Requests to `https://your-app.vercel.app/api/auth/login` will be proxied to `https://YOUR_BACKEND_URL/api/auth/login`.
  2. **Or** deploy no backend and point the frontend at an external API: set `apiUrl` in `frontend/src/environments/environment.prod.ts` to your full API base (e.g. `https://your-api.railway.app/api`), then remove the `/api/:path*` rewrite in `vercel.json` so the SPA rewrite doesn’t catch `/api`.

If you don’t have a backend URL yet, **remove** the first rewrite in `vercel.json` (the one with `"source": "/api/:path*"`). The app will load; login will fail until you add a backend and either proxy it or set `apiUrl` as above. If you use **Option B** (root = `frontend`), edit **frontend/vercel.json** the same way.

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
