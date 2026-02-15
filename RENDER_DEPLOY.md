# Deploy backend on Render and connect Vercel

Follow these steps so the **backend** runs on Render and the **Vercel frontend** can log in.

## 1. Deploy the backend on Render

### Option A: Use the Blueprint (recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/) and sign in (or create an account).
2. Click **New** → **Blueprint**.
3. Connect your **GitHub** account and select the repo **CRUDAppWithAuth-Filtering**.
4. Render will detect the `render.yaml` in the repo. Confirm the service:
   - **Name:** crud-app-api
   - **Root Directory:** backend
   - **Build Command:** npm install
   - **Start Command:** `npm start` (or `node server.js`)
   - **Health Check Path:** /api/health
5. **JWT_SECRET** is set to “Generate” in the Blueprint; you can leave it or replace with your own secret in the service **Environment** tab after creation.
6. Click **Apply** / **Create resources**. Wait for the first deploy to finish.
7. Copy the service URL (e.g. `https://crud-app-api-xxxx.onrender.com`). You’ll use it in step 2.

### Option B: Create a Web Service manually (use this if Blueprint gives "Running '0'")

1. **New** → **Web Service** (not Blueprint).
2. Connect the repo **CRUDAppWithAuth-Filtering**.
3. **Root Directory:** type **`backend`** (no leading slash).
4. **Build Command:** **`npm install`**
5. **Start Command:** type **`npm start`** — do not leave this blank or you may get "Running '0'".
6. **Environment**: Add **JWT_SECRET** (e.g. a long random string) and **NODE_ENV** = **`production`**.
7. Create the service, wait for deploy, then copy the service URL.

---

## 2. Point Vercel at the backend

1. Open your **Vercel** project (the frontend) → **Settings** → **Environment Variables**.
2. Add:
   - **Name:** `NG_APP_API_URL`
   - **Value:** `https://YOUR-RENDER-SERVICE-URL/api`  
     Example: if the Render URL is `https://crud-app-api-xxxx.onrender.com`, use  
     `https://crud-app-api-xxxx.onrender.com/api`  
     (no trailing slash after `api`).
3. Apply to **Production** (and **Preview** if you want).
4. Go to **Deployments** → **⋯** on the latest deployment → **Redeploy**.

After the redeploy, the Vercel app will call your Render API and login will work.

**Note:** On Render’s free tier, the service may spin down after inactivity; the first request after that can take 30–60 seconds to wake up.

---

## Optional: Seed a demo user on Render

The backend uses SQLite. On Render the filesystem is ephemeral, so the DB is recreated on each deploy. To have a demo user after deploy, you can:

- Run the seed once via a one-off shell (if your plan supports it), or
- Use **Register** on the live app to create an account.

To run the seed script locally against the deployed API you’d need to change the app to hit the Render URL; the normal seed script runs against the local DB.

---

## Troubleshooting

### "Running '0'" / "No open ports" / Exit 127

1. Open [Render Dashboard](https://dashboard.render.com) → your backend service → **Settings** → **Build & Deploy**.
2. Find **Start Command**. If it shows **`0`** or is **empty**, that causes the error.
3. **Clear the field** and type exactly: **`npm start`** (or **`node server.js`**). Save.
4. Check **Root Directory** is **`backend`**. Save.
5. **Deployments** → **Manual Deploy** → **Deploy latest commit**.

**If it still fails:** Delete the service (Settings → Delete Web Service). Create a **new Web Service** (New → Web Service, **not** Blueprint):

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** type **`npm start`** (do not skip; if the field is empty or "0", that’s the bug).
- **Environment:** JWT_SECRET (any long string), NODE_ENV = `production`

Before clicking **Create**, confirm the Start Command field shows `npm start` or `node server.js`, not `0` or blank.

### Build fails (e.g. better-sqlite3 / native module)

If the **build** fails (not the deploy step), the log may mention **better-sqlite3** or **node-gyp**. Render’s Node image usually has build tools; if not, try setting **Environment Variable** **NODE_VERSION** = **`20`** (or `18`) and redeploy. If it still fails, share the exact error from the build log.

### Service starts but requests fail / 503

If the deploy succeeds but the app doesn’t respond, check the **Logs** tab for crashes. The app must listen on **`process.env.PORT`**; this backend already does.
