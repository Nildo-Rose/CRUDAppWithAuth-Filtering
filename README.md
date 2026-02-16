# CRUD App With Auth + Filtering

Full-stack application with **JWT authentication**, **Projects** and **Tasks** (parent/child) CRUD, and a clean Angular frontend with **filtering and search**.

## Tech Stack

| Layer   | Technology |
|--------|------------|
| Frontend | **Angular 18** (standalone components, signals, reactive forms), CSS |
| Backend  | **Node.js**, **Express**, **SQLite** (better-sqlite3) |
| Auth     | **JWT** (jsonwebtoken), **bcryptjs** |
| Validation | **express-validator** |

## Features

- **Authentication**: Register, Login, JWT token-based auth, protected routes
- **Projects**: CRUD, list with **pagination**, **text search**, **status filter** (active/archived/completed)
- **Tasks**: CRUD under a project; list with **text search**, **status** and **priority** filters
- **UX**: Clear navigation, consistent dark layout, form validation, error messages

## Project Structure

```
├── backend/           # Express API
│   ├── db/            # SQLite DB init
│   ├── middleware/    # auth, validation
│   ├── routes/        # auth, projects, tasks
│   ├── scripts/       # seed script
│   └── server.js
├── frontend/          # Angular app
│   └── src/
│       ├── app/
│       │   ├── auth/        # login, register
│       │   ├── core/        # auth service, guard, interceptor, API
│       │   ├── projects/    # list, detail, form
│       │   └── tasks/       # task form (inline in project detail)
│       └── environments/
└── README.md
```

## Setup

### Prerequisites

- **Node.js** 18+ (or 20+)
- **npm** 8+

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env if needed (PORT, JWT_SECRET)
npm run seed    # optional: demo user demo@example.com / password123
npm start       # or npm run dev for watch mode
```

API runs at **http://localhost:3000**.

### Frontend

```bash
cd frontend
npm install
npm start
```

App runs at **http://localhost:4200**. The dev server proxies `/api` to the backend on your PC.

### First run

1. Start backend, then frontend.
2. Open http://localhost:4200 → redirects to **Login**.
3. Use **Register** to create an account, or after `npm run seed` use **demo@example.com** / **password123**.
4. After login you'll see **Projects**. Create a project, open it, add tasks, and use search/filters.

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/auth/register` | Register (email, password, name) |
| POST   | `/api/auth/login`    | Login (email, password) |
| GET    | `/api/auth/me`      | Current user (Bearer token) |
| GET    | `/api/projects`     | List projects (paginated, optional `?page`, `?limit`, `?search`, `?status`) |
| GET    | `/api/projects/:id` | Get one project |
| POST   | `/api/projects`     | Create project |
| PUT    | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project (and its tasks) |
| GET    | `/api/projects/:id/tasks` | List tasks (optional `?search`, `?status`, `?priority`) |
| GET    | `/api/projects/:projectId/tasks/:id` | Get one task |
| POST   | `/api/projects/:projectId/tasks` | Create task |
| PUT    | `/api/projects/:projectId/tasks/:id` | Update task |
| DELETE | `/api/projects/:projectId/tasks/:id` | Delete task |

All project and task routes require `Authorization: Bearer <token>`.

## Design Notes

- **Relations**: Projects belong to a user; Tasks belong to a project. Deletion of a project cascades to its tasks.
- **Auth**: JWT stored in `localStorage`; Angular HTTP interceptor adds the header; guard protects `/projects` and children.
- **Pagination**: Only the projects list is paginated (backend); tasks per project are typically smaller and loaded in one go with filters.
- **Validation**: Backend uses express-validator for inputs; frontend uses reactive forms and required/minLength validators.
- **Errors**: API returns `{ error: "message" }` or `{ error: "Validation failed", details: [...] }`; frontend shows them in forms and does not expose stack traces.

## Deploy on Vercel (frontend only)

Deploy the Angular frontend to Vercel:

1. Import the repo at [vercel.com/new](https://vercel.com/new).
2. Either leave **Root Directory** empty (root `vercel.json` builds from `frontend`) or set **Root Directory** to `frontend` and use `frontend/vercel.json`.
3. Deploy. The app will be at your `*.vercel.app` URL.

**Login on the live site:** Set **NG_APP_API_URL** in Vercel (Settings → Environment Variables) to your backend URL including `/api` (e.g. `https://your-backend.example.com/api`), then redeploy. See **VERCEL_DEPLOY.md** for the full checklist.

## Optional: Production build

- **Backend**: Set `NODE_ENV=production` and a strong `JWT_SECRET` in `.env`.
- **Frontend**: `npm run build` in `frontend`; serve `dist/frontend/browser` and proxy `/api` to the Node server if you host them together.

## License

MIT.
