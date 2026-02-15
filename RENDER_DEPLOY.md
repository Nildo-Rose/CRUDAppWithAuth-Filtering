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
   - **Start Command:** `node server.js` (or `npm start`)
   - **Health Check Path:** /api/health
5. **JWT_SECRET** is set to “Generate” in the Blueprint; you can leave it or replace with your own secret in the service **Environment** tab after creation.
6. Click **Apply** / **Create resources**. Wait for the first deploy to finish.
7. Copy the service URL (e.g. `https://crud-app-api-xxxx.onrender.com`). You’ll use it in step 2.

### Option B: Create a Web Service manually (use this if Blueprint gives "Running '0'")

1. **New** → **Web Service** (not Blueprint).
2. Connect the repo **CRUDAppWithAuth-Filtering**.
3. **Root Directory:** type **`backend`** (no leading slash).
4. **Build Command:** **`npm install`**
5. **Start Command:** type **`node server.js`** — do not leave this blank or you may get "Running '0'".
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

## Troubleshooting: "Running '0'" / "No open ports" / Exit 127

If the deploy fails with **Running '0'**, **command not found**, or **No open ports detected**:

**Fix in the Render Dashboard (do this first):**

1. Open [Render Dashboard](https://dashboard.render.com) → your **crud-app-api** (or the backend service) → **Settings**.
2. In **Build & Deploy**, find **Start Command**.
3. **Clear the field completely** (delete any value, including `0`). Then type exactly one of:
   - **`bash start.sh`** (uses the script in the repo), or
   - **`node server.js`**
4. Confirm **Root Directory** is **`backend`** (no leading slash). If it’s wrong, set it to `backend`.
5. Click **Save Changes**.
6. Go to **Deployments** → **Manual Deploy** → **Deploy latest commit**.

**If it still shows "Running '0'": create the service manually (no Blueprint)**

1. In Render Dashboard, **delete** the current backend service (Settings → bottom → Delete Web Service).
2. Click **New** → **Web Service** (do **not** use Blueprint).
3. Connect the same repo **CRUDAppWithAuth-Filtering**.
4. Fill in **by hand** (do not leave any field as default if it looks wrong):
   - **Name:** crud-app-api (or any name)
   - **Region:** pick one
   - **Branch:** main
   - **Root Directory:** `backend` (type it; no leading slash)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js` (type it exactly; do not leave blank)
5. Click **Advanced** → **Add Environment Variable** → **JWT_SECRET** (value: any long random string) and **NODE_ENV** = `production`.
6. Create Web Service. Wait for deploy and copy the URL.

Creating the service this way avoids Blueprint parsing; the Start Command is exactly what you type.
