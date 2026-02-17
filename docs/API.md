# API Documentation

Base URL: `http://localhost:3000` (or your backend origin). All API routes are under `/api`.

## Authentication

Most routes require a JWT. Send it in the header: `Authorization: Bearer <token>`.

---

### POST `/api/auth/register`

Create a new user.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "min6chars",
  "name": "Your Name"
}
```

**Response (201):**
```json
{
  "user": { "id": 1, "email": "user@example.com", "name": "Your Name" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:** 400 if validation fails or email already exists.

---

### POST `/api/auth/login`

Log in and get a JWT.

**Request body:**
```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

**Response (200):**
```json
{
  "user": { "id": 1, "email": "user@example.com", "name": "Your Name" },
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors:** 400 invalid credentials or validation.

---

### GET `/api/auth/me`

Return the current user (requires `Authorization: Bearer <token>`).

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "Your Name"
}
```

**Errors:** 401 if token missing or invalid.

---

### GET `/api/health`

Health check. No auth.

**Response (200):**
```json
{ "ok": true }
```

---

## Projects

All project routes require `Authorization: Bearer <token>`.

### GET `/api/projects`

List projects for the current user. Paginated, with optional filters.

**Query parameters:**

| Param   | Type   | Description                    |
|---------|--------|--------------------------------|
| `page`  | number | Page number (default 1)        |
| `limit` | number | Items per page (default 10)    |
| `search`| string | Filter by name/description     |
| `status`| string | `active`, `archived`, `completed` |

**Response (200):**
```json
{
  "data": [
    {
      "id": 1,
      "user_id": 1,
      "name": "My Project",
      "description": "Optional description",
      "status": "active",
      "created_at": "2025-01-01T12:00:00.000Z",
      "updated_at": "2025-01-01T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 1,
    "totalPages": 1
  }
}
```

---

### GET `/api/projects/:id`

Get one project by ID.

**Response (200):** Single project object. **404** if not found or not owned by user.

---

### POST `/api/projects`

Create a project.

**Request body:**
```json
{
  "name": "Project Name",
  "description": "Optional",
  "status": "active"
}
```

**Response (201):** Created project object.

---

### PUT `/api/projects/:id`

Update a project. Same body as POST. **404** if not found or not owned.

---

### DELETE `/api/projects/:id`

Delete a project and all its tasks. **404** if not found or not owned.

---

## Tasks

All task routes require `Authorization: Bearer <token>`. Tasks belong to a project.

### GET `/api/projects/:projectId/tasks`

List tasks for a project.

**Query parameters:**

| Param     | Type   | Description                          |
|-----------|--------|--------------------------------------|
| `search`  | string | Filter by title/description          |
| `status`  | string | `pending`, `in_progress`, `completed`|
| `priority`| string | `low`, `medium`, `high`              |

**Response (200):** `{ "data": [ ... task objects ... ] }`

---

### GET `/api/projects/:projectId/tasks/:id`

Get one task. **404** if not found or project not owned.

---

### POST `/api/projects/:projectId/tasks`

Create a task.

**Request body:**
```json
{
  "title": "Task title",
  "description": "Optional",
  "status": "pending",
  "priority": "medium"
}
```

**Response (201):** Created task object.

---

### PUT `/api/projects/:projectId/tasks/:id`

Update a task. Same body as POST. **404** if not found.

---

### DELETE `/api/projects/:projectId/tasks/:id`

Delete a task. **404** if not found.

---

## Error format

- **Validation:** `{ "error": "Validation failed", "details": [ { "path": "email", "msg": "..." } ] }`
- **Other:** `{ "error": "message" }`

HTTP status: 400 (validation/client), 401 (unauthorized), 404 (not found), 500 (server error).
