# Project Notes: Line-by-Line Code & Commands Reference

This document explains **every file**, **every line (or logical block) of code**, and **every command** used in the CRUD App With Auth + Filtering project, and **why** each was used.

---

## Part 1: Commands Executed and Why

| Command | Where | Why |
|--------|--------|-----|
| `cd backend` | Backend folder | Change into the Node.js API directory so all following commands run in that context. |
| `npm install` | `backend/` | Install backend dependencies (express, bcryptjs, jsonwebtoken, better-sqlite3, etc.) from `package.json`. Required before running the server. |
| `cp .env.example .env` (or creating `.env`) | `backend/` | Copy environment template so the app has `PORT`, `JWT_SECRET`, `NODE_ENV`. Needed for `dotenv` to load config. |
| `npm run seed` | `backend/` | Run `node scripts/seed.js` to create demo user (demo@example.com / password123) and sample projects/tasks. Optional but useful for testing. |
| `npm start` | `backend/` | Run `node server.js` to start the Express API on port 3000. Must be running for the frontend to call the API. |
| `npm run dev` | `backend/` | Same as start but with `node --watch server.js` so the server restarts when files change. |
| `cd frontend` | Frontend folder | Change into the Angular app directory. |
| `npm install` | `frontend/` | Install Angular and frontend dependencies from `frontend/package.json`. Required before `ng serve` or `ng build`. |
| `npx ng serve` | `frontend/` | Start the Angular development server (default port 4200). Serves the app with live reload. |
| `npx ng serve --open` | `frontend/` | Same as above but also opens the default browser to localhost:4200. |
| `npx ng build` | `frontend/` | Compile the Angular app for production (output in `dist/frontend`). Used to verify the project compiles and to fix build errors. |

---

## Part 2: Backend Files — Line-by-Line

### `backend/package.json`

- **Purpose**: Defines the Node.js project, scripts, and dependencies for the API.
- **name**: Package name for the backend.
- **version**: Semantic version.
- **main**: Entry file is `server.js`.
- **scripts**:
  - `start`: Run the server (`node server.js`).
  - `dev`: Run with `--watch` for auto-restart on file changes.
  - `seed`: Run the seed script to populate demo data.
- **dependencies**:
  - `bcryptjs`: Hash passwords (no native bindings).
  - `cors`: Allow the Angular app (different origin) to call the API.
  - `dotenv`: Load `.env` into `process.env`.
  - `express`: Web framework for routes and middleware.
  - `express-validator`: Validate and sanitize request body/query.
  - `jsonwebtoken`: Create and verify JWT tokens.
  - `better-sqlite3`: SQLite driver for the database.

---

### `backend/.env.example` and `backend/.env`

- **Purpose**: Example and actual environment variables.
- **PORT**: Port the server listens on (default 3000).
- **JWT_SECRET**: Secret key used to sign/verify JWTs; must be strong in production.
- **NODE_ENV**: `development` or `production`; can be used for different behavior (e.g. error details).

`.env` is created from `.env.example` so the app can run without editing code.

---

### `backend/server.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `require('dotenv').config();` | Load `.env` into `process.env` before any code uses it. |
| 2–6 | `require` express, cors, route modules | Import the app and route handlers. |
| 8 | `const app = express();` | Create the Express application. |
| 9 | `const PORT = process.env.PORT \|\| 3000;` | Use env port or default 3000. |
| 11 | `app.use(cors({ origin: true, credentials: true }));` | Allow any origin (for local dev) and credentials (cookies/auth headers). |
| 12 | `app.use(express.json());` | Parse JSON request bodies into `req.body`. |
| 14–16 | `app.use('/api/auth', ...)` etc. | Mount auth routes at `/api/auth`, projects at `/api/projects`, and task routes also at `/api/projects` (nested under project ID). |
| 18 | `app.get('/api/health', ...)` | Health check endpoint; returns `{ ok: true }` to verify server is up. |
| 19–23 | `app.use((err, req, res, next) => ...)` | Global error handler; log error and respond with 500 and a generic message. |
| 25–27 | `app.listen(PORT, ...)` | Start listening on `PORT`; log the URL. |

---

### `backend/db/database.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–2 | `require('better-sqlite3')`, `path` | SQLite driver and path for DB file location. |
| 4 | `dbPath = path.join(__dirname, 'app.db')` | DB file lives next to this file (e.g. `backend/db/app.db`). |
| 5 | `const db = new Database(dbPath)` | Open (or create) the SQLite database. |
| 7–14 | `CREATE TABLE IF NOT EXISTS users` | Users table: id, email (unique), password_hash, name, created_at. |
| 16–25 | `CREATE TABLE IF NOT EXISTS projects` | Projects: id, user_id (owner), name, description, status, timestamps. Foreign key to users. |
| 27–36 | `CREATE TABLE IF NOT EXISTS tasks` | Tasks: id, project_id, title, description, status, priority, timestamps. Foreign key to projects. |
| 38–39 | `CREATE INDEX IF NOT EXISTS` | Indexes on `projects(user_id)` and `tasks(project_id)` for faster queries. |
| 42 | `module.exports = db` | Export the DB instance so routes and seed script can use it. |

---

### `backend/middleware/auth.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `require('jsonwebtoken')` | To verify JWT tokens. |
| 3 | `function authMiddleware(req, res, next)` | Express middleware: runs before route handlers that need a logged-in user. |
| 4 | `const authHeader = req.headers.authorization` | Read the `Authorization` header (e.g. "Bearer &lt;token&gt;"). |
| 5–7 | If no header or not "Bearer ..." | Respond 401 "Authentication required" and stop. |
| 8 | `const token = authHeader.slice(7)` | Remove "Bearer " (7 chars) to get the token string. |
| 9–15 | `jwt.verify(token, ...)` | Verify token with `JWT_SECRET`; on success set `req.user = { id, email }` and call `next()`. |
| 13–14 | `catch` block | On invalid/expired token, respond 401 "Invalid or expired token". |
| 18 | `module.exports = authMiddleware` | So routes can `require` and use this middleware. |

---

### `backend/middleware/validate.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `validationResult` from express-validator | Gets validation errors from the request after validators run. |
| 3 | `function validate(req, res, next)` | Middleware that runs after route-level validators (e.g. `body('email').isEmail()`). |
| 4 | `const errors = validationResult(req)` | Collect errors from validators attached to the route. |
| 5–10 | If `!errors.isEmpty()` | Respond 400 with "Validation failed" and a list of field/message pairs. |
| 11 | `next()` | If no errors, continue to the route handler. |
| 14 | `module.exports = validate` | Export for use in auth and project/task routes. |

---

### `backend/routes/auth.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–7 | require express, bcrypt, jwt, body validators, db, validate, auth | Dependencies for registration, login, and protected /me. |
| 9 | `const router = express.Router()` | Router for `/api/auth` (mounted in server.js). |
| 11–15 | `registerValidation` | Rules: email is email, password min 6 chars, name non-empty. |
| 17–20 | `loginValidation` | Rules: email is email, password present. |
| 21–40 | `POST /register` | Hash password with bcrypt, insert user, return user + JWT. On duplicate email (SQLITE_CONSTRAINT_UNIQUE) return 400. |
| 42–53 | `POST /login` | Find user by email, compare password with bcrypt; if ok, return user + JWT; else 401. |
| 55–59 | `GET /me` | Protected by `auth` middleware; return current user row (id, email, name) or 404. |
| 61 | `module.exports = router` | Mount this router at `/api/auth`. |

---

### `backend/routes/projects.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–5 | require express, validators, db, auth, validate | Dependencies for project CRUD. |
| 7–8 | `router.use(auth)` | All project routes require a valid JWT. |
| 10–14 | `createValidation` | name required; description optional; status optional but must be active/archived/completed. |
| 16–20 | `updateValidation` | Same fields optional; name if present must be non-empty. |
| 22–27 | `listValidation` | Query: page (int ≥1), limit (int 1–100), search (trimmed), status (enum). |
| 29–32 | `getProject(id, userId)` | Fetch project by id and user_id; return null if not found (ensures user owns project). |
| 34–63 | `GET /` | List projects: apply search (name/description LIKE) and status filter; paginate with page/limit; return `{ data, pagination }`. |
| 65–69 | `GET /:id` | Get one project by id for current user; 404 if not found. |
| 71–80 | `POST /` | Create project with user_id from `req.user.id`; return 201 and created project. |
| 82–96 | `PUT /:id` | Update only provided fields; refresh updated_at; return updated project. |
| 98–105 | `DELETE /:id` | Delete all tasks for the project, then the project; return 204. |
| 107 | `module.exports = router` | Mount at `/api/projects`. |

---

### `backend/routes/tasks.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–8 | require and `router.use(auth)` | All task routes require authentication. |
| 10–21 | create/update/list validators | title required for create; optional fields with allowed enums (status, priority). |
| 29–33 | `ensureProjectAccess(projectId, userId)` | Check that the project exists and belongs to the user; return null otherwise. |
| 35–38 | `getTask(id, userId)` | Get task by id and ensure it belongs to a project owned by user (via JOIN). |
| 40–60 | `GET /:projectId/tasks` | Ensure access; filter by search (title/description), status, priority; return `{ data: list }`. |
| 62–67 | `GET /:projectId/tasks/:id` | Get one task; verify it belongs to projectId and user. |
| 69–82 | `POST /:projectId/tasks` | Ensure access; insert task; return 201 and created task. |
| 84–100 | `PUT /:projectId/tasks/:id` | Ensure task exists and belongs to project; update provided fields; return updated task. |
| 102–108 | `DELETE /:projectId/tasks/:id` | Ensure task exists and belongs to project; delete task; return 204. |
| 110 | `module.exports = router` | Mounted at `/api/projects` so paths are `/api/projects/:projectId/tasks` etc. |

---

### `backend/scripts/seed.js`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `require('dotenv').config({ path: ... })` | Load `.env` from backend root so JWT_SECRET etc. are available if needed. |
| 2–3 | require bcrypt, db | Hash password and access database. |
| 5 | `bcrypt.hashSync('password123', 10)` | Hash the demo password. |
| 7–9 | `INSERT OR IGNORE INTO users (id, 1, ...)` | Create user with id=1 if not exists (demo@example.com). |
| 11–14 | userId=1; delete tasks then projects for user 1 | Clear existing demo data so re-running seed replaces it. |
| 16–24 | projectStmt and projects array | Insert three demo projects (Website Redesign, API v2, Mobile App). |
| 26–29 | projectIdsAfter, taskStmt | Get new project IDs and prepare task insert. |
| 31–46 | tasksByProject | Array of task rows per project (title, description, status, priority). |
| 48–53 | forEach projectIdsAfter | Insert tasks for each project. |
| 55 | console.log | Print demo credentials for reference. |

---

## Part 3: Frontend Files — Line-by-Line

### `frontend/package.json`

- **name, version, private**: Frontend app metadata.
- **scripts**: `ng` (CLI), `start` (ng serve), `build` (ng build), `watch` (build in watch mode).
- **dependencies**: Angular 18 packages (core, common, router, forms, etc.), rxjs, zone.js, tslib.
- **devDependencies**: Angular CLI and build/compiler tools, TypeScript 5.4.

---

### `frontend/angular.json`

- **projects.frontend**: Single app named "frontend".
- **sourceRoot**: `src`.
- **prefix**: `app` (component selector prefix, e.g. `app-root`).
- **build.options**: outputPath `dist/frontend`, index `src/index.html`, main `src/main.ts`, polyfills zone.js, tsConfig `tsconfig.app.json`, assets `src/assets`, styles `src/styles.css`.
- **serve**: Dev server uses build target; default configuration is development.

---

### `frontend/tsconfig.json` and `tsconfig.app.json`

- **tsconfig.json**: Strict TypeScript and Angular options; target ES2022; strict templates.
- **tsconfig.app.json**: Extends base; adds `files: ["src/main.ts"]` and `include` for app code; used by the Angular build.

---

### `frontend/src/index.html`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `<!doctype html>` | HTML5 document. |
| 2 | `<html lang="en">` | Root element, language for a11y. |
| 3–5 | `<meta charset>`, `<title>`, `<base href="/">` | UTF-8, app title, base for Angular router. |
| 6 | `<meta name="viewport">` | Responsive viewport. |
| 8–10 | preconnect + Google Fonts (DM Sans) | Load font for consistent typography. |
| 12 | `<body>` | Body contains only the root component. |
| 13 | `<app-root></app-root>` | Angular root component (bootstrap in main.ts). |

---

### `frontend/src/main.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1 | `bootstrapApplication` | Angular 18+ way to bootstrap a standalone app. |
| 2–3 | import appConfig, AppComponent | Config (router, HTTP, interceptors) and root component. |
| 5 | `bootstrapApplication(AppComponent, appConfig).catch(...)` | Start the app with the given config; log any bootstrap error. |

---

### `frontend/src/styles.css`

- **:root**: CSS variables for theme (background, surface, border, text, accent, success, warning, danger, radius, font). Eases consistent styling and theming.
- **\***: `box-sizing: border-box` so padding doesn’t break layout.
- **body**: Default font, background, color, line-height, min-height.
- **a**: Link color and hover (accent).
- **button, .btn**: Shared button look and disabled state.
- **input, select, textarea**: Inherit font/size.
- **.container**: Max-width 960px, centered, horizontal padding.
- **.card**: Surface background, border, radius, padding.
- **.form-group**: Label styling and full-width inputs; focus ring; .error in red.
- **.btn-primary / .btn-secondary / .btn-danger**: Primary (accent), secondary (outline), danger (red outline).
- **.badge** and **.badge-***: Small status/priority pills with colors (active, archived, completed, pending, in_progress, low, medium, high).

---

### `frontend/src/environments/environment.ts` and `environment.prod.ts`

- **environment.ts**: `production: false`, `apiUrl: 'http://localhost:3000/api'` so dev uses the local backend.
- **environment.prod.ts**: `production: true`, `apiUrl: '/api'` for production (same host/proxy).

---

### `frontend/src/app/app.config.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–5 | import ApplicationConfig, provideZoneChangeDetection, provideRouter, provideHttpClient, withInterceptors, routes, authInterceptor | Angular providers and our route/auth setup. |
| 7–13 | appConfig object | provideZoneChangeDetection (eventCoalescing); provideRouter(routes); provideHttpClient(withInterceptors([authInterceptor])) so every HTTP request can attach the JWT. |

---

### `frontend/src/app/app.routes.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–2 | import Routes, authGuard | Route config and guard for protected routes. |
| 4 | `path: ''` redirectTo `'projects'` | Default route is projects list. |
| 5–6 | `/login`, `/register` | Lazy-load login and register components (smaller initial bundle). |
| 8–26 | `/projects`, `/projects/new`, `/projects/:id`, `/projects/:id/edit` | All use `canActivate: [authGuard]` so only logged-in users can access; lazy-load list, form, detail. |
| 28 | `path: '**'` redirectTo `'projects'` | Catch-all sends unknown URLs to projects. |

---

### `frontend/src/app/app.component.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–4 | import Component, RouterLink, RouterLinkActive, RouterOutlet, AuthService, NgIf | Root component needs router and auth. |
| 6–9 | selector, standalone, imports | app-root; standalone with RouterOutlet, RouterLink, RouterLinkActive, NgIf. |
| 10–25 | template | Shell: header (only if logged in) with logo, "Projects" link (routerLinkActive with exact: true), user name, Log out; main with `<router-outlet />`. |
| 26–36 | styles | Layout for app-shell, header, logo, nav, active link, user, main. |
| 39–41 | class, constructor(public auth) | Expose AuthService in template as `auth`. |

---

### `frontend/src/app/core/services/auth.service.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–5 | import Injectable, signal, computed, HttpClient, Router, tap, catchError, of, environment | Reactive state and HTTP for auth. |
| 7–16 | User, AuthResponse interfaces | Type the /me response and login/register response (user + token). |
| 18 | `@Injectable({ providedIn: 'root' })` | Single instance app-wide. |
| 20–23 | tokenSignal, userSignal, currentUser computed | token from localStorage; user from API or null; currentUser = userSignal. |
| 25–31 | constructor: getStoredToken(); if (t) loadUser() | On init, if token exists fetch user and set userSignal. |
| 33–35 | getStoredToken() | Return localStorage.getItem('token'). |
| 37–46 | loadUser() | GET /auth/me; on success set userSignal; on error clear token and userSignal. |
| 48–52 | isLoggedIn(), getToken() | For guard and interceptor. |
| 55–64 | register() | POST /auth/register; on success store token, set signals, navigate to /projects. |
| 66–75 | login() | POST /auth/login; same as register. |
| 77–82 | logout() | Clear storage and signals; navigate to /login. |

---

### `frontend/src/app/core/guards/auth.guard.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–3 | inject Router, CanActivateFn, AuthService | Functional guard needs router and auth. |
| 5–11 | authGuard: if isLoggedIn() return true; else navigate to /login, return false | Block access to protected routes when not logged in; redirect to login. |

---

### `frontend/src/app/core/interceptors/auth.interceptor.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–3 | HttpInterceptorFn, inject, AuthService | Functional interceptor. |
| 5–14 | If token exists, clone request with Authorization: Bearer &lt;token&gt;; then next(req) | Attach JWT to every outgoing HTTP request so backend auth middleware can verify. |

---

### `frontend/src/app/core/services/api.service.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–4 | import Injectable, HttpClient, HttpParams, Observable, environment | HTTP client and base URL. |
| 6–29 | Project, Task, PaginatedResponse interfaces | Match backend response shapes. |
| 32–34 | base = environment.apiUrl, constructor(http) | Centralize API base URL. |
| 38–44 | getProjects(params) | GET /projects with page, limit, search, status query params; return PaginatedResponse<Project>. |
| 46–48 | getProject(id) | GET /projects/:id. |
| 50–58 | createProject, updateProject, deleteProject | POST, PUT, DELETE for projects. |
| 62–67 | getTasks(projectId, params) | GET /projects/:projectId/tasks with search, status, priority. |
| 69–84 | getTask, createTask, updateTask, deleteTask | Single task and create/update/delete for tasks. |

---

### `frontend/src/app/auth/login/login.component.ts`

- **Imports**: Component, RouterLink, FormBuilder, ReactiveFormsModule, Validators, AuthService, NgIf.
- **Template**: Centered card with email and password inputs, validation messages, submit button, link to register.
- **Form**: nonNullable group with email (required, email) and password (required).
- **onSubmit**: If valid and not loading, call auth.login(); on error set loading false and show err.error?.error or "Login failed".

---

### `frontend/src/app/auth/register/register.component.ts`

- Same pattern as login: name, email, password (minLength 6); auth.register(email, password, name); error handling and link to login.

---

### `frontend/src/app/projects/project-list/project-list.component.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 1–5 | imports including signal, ApiService, NgClass | List state and API; NgClass for badge-* classes. |
| 18–31 | filters card | Search input and status dropdown; (ngModelChange) calls applyFilters() to reload page 1. |
| 33–47 | list and pagination | *ngFor projects(); View tasks / Edit / Delete buttons; pagination Previous/Next and page of totalPages. |
| 74–79 | signals: projects, loading, page, totalPages; search, statusFilter | Reactive state for list and filters. |
| 84–85 | ngOnInit: load() | Load projects on init. |
| 87–95 | applyFilters(), goPage(), load() | applyFilters sets page 1 and load(); goPage sets page and load(); load() calls getProjects with page, limit 10, search, status and updates signals. |
| 115–120 | delete(p) | Confirm then deleteProject(p.id); on success reload list. |

---

### `frontend/src/app/projects/project-form/project-form.component.ts`

- **Form**: name (required), description, status (active | archived | completed).
- **ngOnInit**: If route has `id`, set isEdit and id; fetch project and patchValue (with status cast for type safety).
- **onSubmit**: create or update via API; on success navigate to /projects/:id; on error set error message and loading false.

---

### `frontend/src/app/projects/project-detail/project-detail.component.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 12–24 | toolbar | Back link, project name, status badge, description, Edit project link. |
| 26–37 | tasks section | "Add task" button; app-task-form when showTaskForm() with projectId, task (for edit), (saved), (cancel). |
| 39–53 | task filters | Search, status, priority; (ngModelChange) calls loadTasks(). |
| 55–71 | task list | *ngFor tasks(); title, status/priority badges, description, Edit/Delete; empty message. |
| 102–115 | project, tasks, tasksLoading, showTaskForm, editingTask, taskSearch, taskStatus, taskPriority | State for project, task list, form visibility, and filters. |
| 117–127 | ngOnInit | Get project by route id; then loadTasks(). |
| 129–144 | loadTasks() | getTasks(project.id, search, status, priority); update tasks and tasksLoading. |
| 146–171 | openNewTask, editTask, closeTaskForm, onTaskSaved, deleteTask | Show form for new vs edit; close and reload list; delete with confirm. |

---

### `frontend/src/app/tasks/task-form/task-form.component.ts`

| Line(s) | Code | Why |
|--------|------|-----|
| 52–56 | input.required projectId; input task; output saved, cancel | Parent passes project and optional task; emits on save or cancel. |
| 58–64 | form: title (required), description, status, priority | Status and priority use union types for select values. |
| 68–75 | effect(() => { task(); if (t) patchValue(...) }) | When task() input is set (edit mode), patch form with task data (with casts for status/priority). |
| 77–98 | onSubmit | create or update task; on success saved.emit() and loading false; on error set error message. |

---

## Part 4: File Tree Summary

```
backend/
  .env                    # PORT, JWT_SECRET, NODE_ENV (from .env.example)
  .env.example            # Template for .env
  package.json            # Scripts and dependencies
  server.js               # Express app, CORS, JSON, routes, error handler, listen
  db/
    database.js          # SQLite connection, create tables and indexes
  middleware/
    auth.js              # JWT verification, set req.user
    validate.js          # express-validator result check, 400 on errors
  routes/
    auth.js              # POST /register, POST /login, GET /me
    projects.js          # CRUD /projects (list with pagination/search/status)
    tasks.js             # CRUD /projects/:projectId/tasks (list with search/status/priority)
  scripts/
    seed.js              # Demo user + projects + tasks

frontend/
  package.json
  angular.json
  tsconfig.json
  tsconfig.app.json
  src/
    index.html
    main.ts
    styles.css
    assets/
      .gitkeep
    environments/
      environment.ts
      environment.prod.ts
    app/
      app.config.ts
      app.routes.ts
      app.component.ts
      core/
        services/
          auth.service.ts
          api.service.ts
        guards/
          auth.guard.ts
        interceptors/
          auth.interceptor.ts
      auth/
        login/
          login.component.ts
        register/
          register.component.ts
      projects/
        project-list/
          project-list.component.ts
        project-form/
          project-form.component.ts
        project-detail/
          project-detail.component.ts
      tasks/
        task-form/
          task-form.component.ts
```

---

This document is the single reference for **what each file and block of code does** and **why each command was run** in the project.
