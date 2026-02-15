# Fix Vercel 404 – Checklist

Follow these steps **exactly** so the app deploys instead of 404.

## "Error creating build plan with Railpack" (build fails before compiling)

Use **Option B** below: set **Root Directory** to **`frontend`** so Vercel treats the app as a standard Angular project. Building from the repo root with custom commands can trigger this Railpack error.

## How API URL works (dev vs prod)

- **Local dev (PC and mobile):** The app uses the **same host as the page** with port **3000**. Ensure the backend is running.
- **Production (Vercel):** By default the app uses `apiUrl` = **`/api`** (same origin). Vercel only serves the frontend, so `/api` returns the app HTML and **login fails**. To fix it, deploy the backend and set the env var below.

**If you see "Cannot reach API" or "Login failed" on the live site** → The frontend has no backend yet. Follow **Enable login on Vercel** below.

## Enable login on Vercel

1. **Deploy the backend** on [Render](https://render.com). Use the repo’s **Blueprint** (see **[RENDER_DEPLOY.md](RENDER_DEPLOY.md)** for step-by-step instructions). Your API will be at a URL like `https://your-app.onrender.com` (with routes like `/api/auth/login`, `/api/projects`, etc.).
2. In **Vercel** → your project → **Settings** → **Environment Variables**:
   - **Name:** `NG_APP_API_URL`
   - **Value:** your backend base URL including `/api`, e.g. `https://your-app.onrender.com/api` (no trailing slash after `api`).
   - Apply to **Production** (and Preview if you want).
3. **Redeploy** the Vercel project (Deployments → ⋯ → Redeploy). The build runs `node scripts/write-env.js` and writes this URL into the production build, so login and all API calls will go to your backend.

## "No start command was found" (Railpack)

Railpack is looking for a Node server. This app is a **static site** (Angular build output). Add this **Environment Variable** in Vercel so Railpack serves the built files:

- **Name:** `RAILPACK_SPA_OUTPUT_DIR`
- **Value:** `dist/frontend/browser`
- Apply to **Production** (and Preview if you want).

Then **Redeploy**. Keep **Root Directory** = **`frontend`** and **Output Directory** = `dist/frontend/browser` as in Option B.

## Option B: Build from `frontend` folder (recommended — avoids Railpack errors)

1. **Settings** → **General** → **Root Directory**: set to **`frontend`** → Save.
2. **Build & Development Settings**:
   - **Build Command** Override: `npm run build`
   - **Output Directory** Override: `dist/frontend/browser`
3. **Settings** → **Environment Variables** → add **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser` (so Railpack treats the app as a static site; see “No start command was found” above).
4. Save and **Redeploy**.

## Option A: Build from repo root

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **General**.
2. **Root Directory**: leave **empty**. Click **Save** if you change it.
3. Go to **Settings** → **Build & Development Settings**.
4. **Framework Preset**: choose **Other**.
5. **Build Command** Override: `cd frontend && npm install && npm run build`
6. **Output Directory** Override: `frontend/dist/frontend/browser`
7. **Install Command** Override: `cd frontend && npm install`
8. Save, then **Deployments** → **⋯** → **Redeploy**.

## After redeploy

- Open the deployment URL. You should see the app (Login page or redirect to it).

## Still the same? (Login fails / same error)

- **If you’re on the Vercel URL** (e.g. `crud-app-with-auth-filtering.vercel.app`):
  1. Set **NG_APP_API_URL** (see “Enable login on Vercel” above) and save.
  2. **Redeploy**: Deployments → **⋯** on latest → **Redeploy** (use **Redeploy with existing Build Cache** unchecked to force a fresh build).
  3. In the **Build Logs**, confirm you see: `Wrote environment.prod.ts with apiUrl: https://your-backend...` (not `apiUrl: /api`). If you see `/api`, the env var wasn’t applied — check it’s set for **Production** and redeploy again.
- **If you’re on your PC at localhost:4200** (local dev): Start the backend first: `cd backend && npm start`. Leave it running, then use the app; otherwise you’ll get “Cannot reach server… localhost:3000”.

## Still having issues?

1. **404 on every route** – Set **Build Command** and **Output Directory** overrides as in Option B (or A) above, then **Redeploy**.
2. **Build fails / "Error creating build plan with Railpack"** – Switch to **Option B**: set **Root Directory** to **`frontend`**, set **Output Directory** to `dist/frontend/browser`, then **Redeploy**. Also check the **Building** tab for other errors.
3. **"No start command was found"** – Add env var **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser` (Settings → Environment Variables), then **Redeploy**. This tells Railpack to serve the Angular build as a static site.
4. **Blank page or wrong content** – Confirm **Output Directory** is exactly `dist/frontend/browser` (Option B) or `frontend/dist/frontend/browser` (Option A); Angular 18 puts the app in the `browser` subfolder.
