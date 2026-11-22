# HireMind

Full-stack hiring intelligence platform starter featuring **FastAPI**, **SQLite (via SQLAlchemy)**, **JWT Authentication**, **Automated CSV Job Seeding**, **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router**, and **Lucide Icons**.

---

## Architecture & Data Models

### Database Models (`backend/app/models.py`)

- **`User`**:
  - `id`: Integer, primary key
  - `email`: String(255), unique, indexed
  - `hashed_password`: String(255), bcrypt hashed
  - `created_at`: DateTime
  - Relationships: `profile` (one-to-one), `saved_jobs` (one-to-many)

- **`Profile`**:
  - `id`: Integer, primary key
  - `user_id`: Integer, ForeignKey to `users.id` (unique, cascade delete)
  - `experience_level`: String(50) (e.g. `"Junior"`, `"Mid"`, `"Senior"`, `"Lead"`)
  - `location`: String(100)
  - `work_mode`: String(50) (e.g. `"Remote"`, `"Hybrid"`, `"On-site"`)
  - Relationships: `user` (many-to-one), `skills` (one-to-many, cascade delete)

- **`Skill`**:
  - `id`: Integer, primary key
  - `profile_id`: Integer, ForeignKey to `profiles.id` (cascade delete)
  - `name`: String(100) (e.g. `"FastAPI"`, `"React"`, `"Python"`)
  - Relationships: `profile` (many-to-one)

- **`Job`**:
  - `id`: Integer, primary key
  - `title`: String(255)
  - `company`: String(255)
  - `description`: Text
  - `location`: String(100)
  - `work_mode`: String(50) (`"Remote"`, `"Hybrid"`, `"On-site"`)
  - `experience_level`: String(50) (`"Entry"`, `"Mid"`, `"Senior"`, `"Lead"`)
  - `skills`: String(500) (comma-separated string, e.g. `"React, TypeScript, FastAPI"`)
  - `apply_url`: String(500)
  - `created_at`: DateTime
  - Relationships: `saved_by_users` (one-to-many)

- **`SavedJob`**:
  - `id`: Integer, primary key
  - `user_id`: Integer, ForeignKey to `users.id`
  - `job_id`: Integer, ForeignKey to `jobs.id`
  - `created_at`: DateTime
  - Unique Constraint: `(user_id, job_id)`

---

## API Endpoints

### 1. Job Endpoints (`backend/app/routes/jobs.py`)

#### `GET /jobs`
Paginated search and filtering across the entire job catalog.
- **Query Parameters**:
  - `q`: Search keyword matching `title`, `company`, `description`, or `skills`
  - `location`: Substring match on job location (e.g. `Remote`, `San Francisco`, `New York`)
  - `work_mode`: Filter by work mode (`Remote`, `Hybrid`, `On-site`)
  - `experience_level`: Filter by seniority level (`Entry`, `Mid`, `Senior`, `Lead`)
  - `page`: 1-based page index (default: `1`)
  - `limit`: Number of jobs per page (default: `10`, max: `100`)
- **Example Request**:
  ```bash
  curl "http://localhost:8000/jobs?q=python&work_mode=Remote&experience_level=Senior&page=1&limit=5"
  ```
- **Example Response (`200 OK`)**:
  ```json
  {
    "items": [
      {
        "id": 1,
        "title": "Senior Python Backend Engineer",
        "company": "CloudScale AI",
        "description": "Design, implement, and scale distributed FastAPI microservices...",
        "location": "Remote",
        "work_mode": "Remote",
        "experience_level": "Senior",
        "skills": "Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes",
        "apply_url": "https://careers.cloudscale.ai/jobs/sr-backend-py",
        "created_at": "2026-11-22T22:42:00"
      }
    ],
    "total": 1,
    "page": 1,
    "limit": 5,
    "total_pages": 1
  }
  ```
  *(Also returns standard pagination headers: `X-Total-Count`, `X-Page`, `X-Limit`, `X-Total-Pages`)*

#### `GET /jobs/{id}`
Retrieve full details of a specific job by its primary key ID.
- **Example Request**:
  ```bash
  curl http://localhost:8000/jobs/1
  ```
- **Response (`200 OK` or `404 Not Found`)**:
  ```json
  {
    "id": 1,
    "title": "Senior Python Backend Engineer",
    "company": "CloudScale AI",
    "location": "Remote",
    "work_mode": "Remote",
    "experience_level": "Senior",
    "skills": "Python, FastAPI, PostgreSQL, Redis, Docker, Kubernetes",
    "apply_url": "https://careers.cloudscale.ai/jobs/sr-backend-py",
    "created_at": "2026-11-22T22:42:00"
  }
  ```

---

### 2. Saved Jobs Endpoints (Scoped to Logged-in User)

All saved-job routes require the standard `Authorization: Bearer <token>` header obtained from `/auth/login` or `/auth/register`.

#### `POST /jobs/{id}/save`
Bookmarks a job for the currently logged-in user (idempotent).
- **Header**: `Authorization: Bearer <token>`
- **Example Request**:
  ```bash
  curl -X POST http://localhost:8000/jobs/1/save \
    -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "id": 1,
    "user_id": 1,
    "job_id": 1,
    "created_at": "2026-11-22T22:50:00",
    "job": {
      "id": 1,
      "title": "Senior Python Backend Engineer",
      "company": "CloudScale AI", ...
    }
  }
  ```

#### `DELETE /jobs/{id}/save`
Removes a saved job from the logged-in user's bookmark list.
- **Header**: `Authorization: Bearer <token>`
- **Example Request**:
  ```bash
  curl -X DELETE http://localhost:8000/jobs/1/save \
    -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
  ```
- **Response (`200 OK`)**:
  ```json
  {
    "message": "Job 1 successfully removed from saved list",
    "job_id": 1,
    "saved": false
  }
  ```

#### `GET /saved` (or `GET /jobs/saved`)
Retrieves all jobs bookmarked by the currently authenticated user.
- **Header**: `Authorization: Bearer <token>`
- **Example Request**:
  ```bash
  curl -X GET http://localhost:8000/saved \
    -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
  ```
- **Response (`200 OK`)**:
  ```json
  [
    {
      "id": 1,
      "user_id": 1,
      "job_id": 1,
      "created_at": "2026-11-22T22:50:00",
      "job": {
        "id": 1,
        "title": "Senior Python Backend Engineer",
        "company": "CloudScale AI", ...
      }
    }
  ]
  ```

---

### 3. Authentication Endpoints

- `POST /auth/register`: Create user with hashed password & profile/skills
- `POST /auth/login`: Authenticate and receive JWT token
- `GET /me`: Get authenticated user profile & skills

---

## How to Run

### Backend
```bash
cd backend

# Setup environment & virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows PowerShell
# source venv/bin/activate     # On macOS/Linux

cp .env.example .env
pip install -r requirements.txt

# Start FastAPI server (seeds jobs from CSV automatically on first startup)
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Visit [http://localhost:5173/jobs](http://localhost:5173/jobs) to test the live job search, filtering, pagination, and save functionality!
