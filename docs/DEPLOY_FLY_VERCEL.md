# Deploy Backend to Fly.io and Frontend to Vercel

This guide gets the full app working with the backend on **Fly.io** and the frontend on **Vercel**, so the Vercel site can log in and use the API.

## 1. Deploy the backend to Fly.io

**Important:** All `fly` commands must be run from the **`backend`** directory (where the Dockerfile and `fly.toml` live). Running from the project root will fail with "Could not find a Dockerfile".

### Prerequisites

- [Fly.io account](https://fly.io/app/sign-up)
- [flyctl CLI](https://fly.io/docs/hands-on/install-flyctl/) installed

### Steps

1. **Open the backend folder**, then log in and create the app:

   ```bash
   cd backend
   fly auth login
   fly apps create crud-app-api
   ```

   If the app name `crud-app-api` is taken, choose another (e.g. `crud-app-api-yourname`) and use that name in the Fly URL and in Vercel’s `NG_APP_API_URL` below.

2. **Create a volume** for SQLite (pick a [region](https://fly.io/docs/reference/regions/) near you, e.g. `iad`, `lax`, `ord`):

   ```bash
   fly volumes create data --size 1 --region iad
   ```

3. **Set the JWT secret** (use a long random string in production):

   ```bash
   fly secrets set JWT_SECRET=your-secure-random-secret
   ```

4. **Deploy**:

   ```bash
   fly deploy
   ```

5. **Check the API**:

   ```bash
   curl https://crud-app-api.fly.dev/api/health
   ```

   You should see `{"ok":true}`. Your backend URL is **`https://crud-app-api.fly.dev`** (or your app name).

6. **If you deploy via GitHub** (Fly.io “Deploy” or CI), the app may have a different name (e.g. `crudappwithauth-filtering-60obkq`). You still must **create the volume** for that app, in the region your `fly.toml` uses (e.g. `iad`):

   ```bash
   fly volumes create data --region iad --app YOUR_APP_NAME --size 1
   ```

   If the error says `iad=2`, create two volumes (run the command twice, or use `-n 2` if your CLI supports it). Then redeploy.

7. **(Optional) Seed a demo user** (run once, then remove or keep for testing):

   ```bash
   fly ssh console
   node scripts/seed.js
   exit
   ```

   Then you can log in with `demo@example.com` / `password123`.

---

## 2. Point the Vercel frontend at the Fly API

The frontend is built with `scripts/write-env.js`, which reads **`NG_APP_API_URL`** and writes `environment.prod.ts`. So the production build must have that env var set.

### On Vercel

1. Open your project on [Vercel](https://vercel.com) → **Settings** → **Environment Variables**.

2. Add:

   | Name             | Value                                | Environment |
   |------------------|--------------------------------------|-------------|
   | `NG_APP_API_URL` | `https://crud-app-api.fly.dev/api`   | Production  |

   Use your real Fly app URL if it’s different (e.g. `https://your-app-name.fly.dev/api`).

3. **Redeploy** the frontend (e.g. push a commit or **Deployments** → … → **Redeploy**).

After the redeploy, the Vercel site will call the Fly.io API and login should work.

---

## 3. CORS

The backend uses `cors({ origin: true, credentials: true })`, so the Vercel origin is allowed. No extra CORS config is needed.

---

## 4. Troubleshooting

### "Process group 'app' needs volumes with name 'data'"

The app’s `fly.toml` mounts a volume named `data` for SQLite. Create it for **your** app and region (e.g. `iad=2` means 2 volumes in `iad`):

```bash
fly volumes create data --region iad --app crudappwithauth-filtering-60obkq --size 1
fly volumes create data --region iad --app crudappwithauth-filtering-60obkq --size 1
```

Replace `crudappwithauth-filtering-60obkq` with your app name if different. Then trigger a new deploy (push a commit or “Redeploy” in the Fly dashboard).

### Set JWT_SECRET for the same app

```bash
fly secrets set JWT_SECRET=your-secure-secret --app crudappwithauth-filtering-60obkq
```

---

## 5. Summary

| Where   | URL (example)                          | Role                    |
|--------|----------------------------------------|-------------------------|
| Fly.io | `https://crud-app-api.fly.dev`         | Backend API             |
| Vercel | `https://crud-app-with-auth-filtering.vercel.app` | Frontend (uses Fly API) |

- **Backend:** Fly.io, with a `data` volume for SQLite and `JWT_SECRET` set as a secret.
- **Frontend:** Vercel, with `NG_APP_API_URL` set to `https://<your-fly-app>.fly.dev/api` so the built app talks to Fly.
