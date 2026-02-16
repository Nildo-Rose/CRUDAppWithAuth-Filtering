# Deploy on Vercel – Checklist

The app runs **entirely on Vercel** (frontend + API). Deploy from **repo root** so both the Angular app and the serverless API are built and deployed.

## Vercel-only (API on Vercel)

1. In Vercel → your project → **Settings** → **General** → **Root Directory**: leave **empty** so the repo root is used.
2. The root `vercel.json` already sets:
   - **Install:** `cd backend && npm install && cd ../frontend && npm install`
   - **Build:** `cd frontend && npm run build`
   - **Output:** `frontend/dist/frontend/browser`
   - **Rewrites:** `/api/*` → serverless API, everything else → SPA.
3. Deploy. No **NG_APP_API_URL** needed: the frontend uses `/api` (same origin) and the API runs as a Vercel serverless function.

Use **Register** on the live site to create an account (the serverless DB is ephemeral; data may reset on cold starts).

## If you use Root Directory = `frontend`

Then only the frontend is deployed and there is no API on Vercel. Either:

- Switch to **Root Directory: empty** (above), or  
- Deploy the backend elsewhere and set **NG_APP_API_URL** in Vercel to that backend URL + `/api`, then redeploy.

## How API URL works

- **Local dev (PC):** Run `cd backend && npm start` and `cd frontend && npm start`. The app uses **http://localhost:3000/api**.
- **Production (Vercel, repo root):** Frontend uses `/api`; `/api/*` is handled by the serverless function in the `api/` folder (same domain).

## Build / Railpack issues

- **"Error creating build plan with Railpack"** – Use **Root Directory: empty** and let the root `vercel.json` drive the build (or set Overrides to match it).
- **"No start command was found"** – Add **RAILPACK_SPA_OUTPUT_DIR** = `dist/frontend/browser` (only needed if you override Root Directory to `frontend`).
- **404 / blank page** – Confirm **Output Directory** is `frontend/dist/frontend/browser` when building from repo root.

## Local dev (PC)

- Backend: `cd backend && npm start`
- Frontend: `cd frontend && npm start`
- Open **http://localhost:4200** (dev server proxies `/api` to port 3000).
