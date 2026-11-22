# HireMind

> A job-matching platform that scores every listing 0–100 against your skills, experience and work preferences, and shows exactly which skills you are missing.

![Status](https://img.shields.io/badge/status-in%20development-indigo)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61dafb)
![Database](https://img.shields.io/badge/database-SQLite-003b57)

---

## Table of Contents

1. [Overview](#overview)
2. [Screenshots](#screenshots)
3. [Features](#features)
4. [Tech Stack](#tech-stack)
5. [How Matching Works](#how-matching-works)
6. [Project Structure](#project-structure)
7. [Getting Started](#getting-started)
8. [Environment Variables](#environment-variables)
9. [API Reference](#api-reference)
10. [Database Schema](#database-schema)
11. [Testing](#testing)
12. [Deployment](#deployment)
13. [Troubleshooting](#troubleshooting)
14. [Roadmap](#roadmap)
15. [Contributing](#contributing)
16. [License](#license)

---

## Overview

Job boards show hundreds of listings but rarely tell you how well you fit. HireMind fixes that. You enter your skills, experience level, location and work-mode preference once, and every job gets a **match score (0–100)** with a clear breakdown of **matched skills** and **missing skills**, so you can focus on roles that fit and know what to learn for the rest.

## Screenshots

> Add screenshots to a `docs/` folder and update the paths.

| Landing | Register | Dashboard |
|---|---|---|
| `docs/landing.png` | `docs/register.png` | `docs/dashboard.png` |

| Search | Job Details | Saved Jobs |
|---|---|---|
| `docs/search.png` | `docs/job-details.png` | `docs/saved.png` |

---

## Features

Legend: ✅ core (built in the main steps) · 🟡 optional / stretch · 🔭 future idea

### Authentication and Accounts
- ✅ Register and login with email and password
- ✅ Passwords hashed (bcrypt); JWT-based sessions
- ✅ Protected routes on frontend and backend
- ✅ Per-user data isolation (one user can never read another's data)
- 🟡 Logout everywhere / token refresh
- 🔭 Password reset by email
- 🔭 Google / GitHub OAuth login

### Candidate Profile
- ✅ Skills (stored lowercase, deduplicated)
- ✅ Experience level (intern / junior / mid / senior)
- ✅ Preferred location and work mode (remote / hybrid / onsite)
- ✅ 3-step onboarding wizard with progress bar
- ✅ Editable profile page
- 🔭 Resume upload (PDF/DOCX) with auto-extracted skills
- 🔭 Profile completeness meter

### Job Search and Discovery
- ✅ Keyword search across title, company and skills
- ✅ Filters: location, work mode, experience level
- ✅ Pagination
- ✅ Skeleton loading states
- ✅ 60+ seeded jobs loaded from CSV without duplicates
- 🟡 Sort by match score, newest, or company
- 🟡 Skill-based filter chips
- 🔭 Semantic (embedding) search
- 🔭 Live job feeds from external APIs

### Match Scoring
- ✅ 0–100 score per job based on your profile
- ✅ Matched and missing skills per job
- ✅ Plain-language reasons ("You match 4 of 6 required skills")
- ✅ Circular match-score ring on every job card
- ✅ Personalized `/recommendations` endpoint
- 🟡 Skill-gap summary across all saved jobs
- 🔭 Learning-resource suggestions for missing skills

### Saved Jobs and Tracking
- ✅ Bookmark and unbookmark jobs
- ✅ Saved Jobs page
- 🟡 Application status: Saved → Applied → Interview → Rejected / Offer
- 🟡 Personal notes on each saved job
- 🔭 Follow-up reminders and email digests

### AI Assistant (Optional)
- 🟡 Chat assistant powered by Groq
- 🟡 Allowlisted tools only: `search_jobs`, `get_skill_gaps`
- 🟡 User ID taken from the JWT, never from the model
- 🟡 Maximum 3 tool calls per message, with a friendly fallback on errors
- 🟡 Job cards rendered inside chat replies

### UI / UX
- ✅ Professional SaaS design: indigo primary, slate neutrals, Inter font
- ✅ Dark mode
- ✅ Fully responsive (mobile, tablet, desktop)
- ✅ Reusable components: Button, Input, Card, Badge, Modal, Toast, Skeleton, EmptyState, Navbar
- ✅ Inline form validation, loading states and error toasts
- ✅ Empty states, 404 page, error boundary, favicon
- ✅ Accessible: labels, focus rings, contrast checks
- 🟡 Page transitions and micro-animations
- 🟡 Landing page with hero, features and call-to-action

### Quality and Security
- ✅ Pydantic validation on all request bodies
- ✅ CORS restricted to the frontend origin
- ✅ Secrets kept in `.env`, never committed
- ✅ Pytest unit tests for the scoring engine
- 🟡 API tests for auth and cross-user access
- 🟡 Rate limiting on login and chat
- 🔭 GitHub Actions CI (lint, test, build)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Vite, Tailwind CSS, React Router, lucide-react |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite with SQLAlchemy ORM |
| Auth | JWT, bcrypt password hashing |
| Testing | Pytest |
| AI (optional) | Groq API with tool-calling |
| Deployment | Render (backend), Vercel (frontend) |

---

## How Matching Works

Each job gets a score from three components, each normalized to 0–1:

```
score = 0.60 × skill_coverage
      + 0.20 × experience_fit
      + 0.20 × preference_fit
```

| Component | Weight | How it is calculated |
|---|---|---|
| Skill coverage | 60% | matched required skills ÷ total required skills |
| Experience fit | 20% | 1.0 for exact level, partial credit for adjacent levels |
| Preference fit | 20% | work-mode match and location match |

The final value is multiplied by 100 and rounded. The engine lives in `backend/app/matcher.py` as a pure function, so it is easy to unit test. Skills are normalized to lowercase before comparison.

**Example response:**

```json
{
  "match_score": 78,
  "matched_skills": ["python", "fastapi", "sql"],
  "missing_skills": ["docker"],
  "reasons": ["You match 3 of 4 required skills", "Remote matches your preference"]
}
```

---

## Project Structure

```
hiremind/
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app, CORS, startup seeding
│   │   ├── models.py          # SQLAlchemy models
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── auth.py            # JWT + password hashing
│   │   ├── matcher.py         # Match scoring (pure functions)
│   │   ├── routes/            # auth, profile, jobs, saved, assistant
│   │   └── seed.py            # CSV → DB loader
│   ├── data/jobs.csv          # 60+ sample jobs
│   ├── tests/                 # Pytest tests
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── pages/             # Landing, Login, Register, Onboarding, Dashboard,
│   │   │                      # Search, JobDetails, Saved, Profile, Assistant, 404
│   │   ├── services/api.ts    # API layer with JWT handling
│   │   └── main.tsx
│   ├── package.json
│   └── .env.example
├── docs/                      # Screenshots
├── .gitignore
└── README.md
```

> Folder names may differ slightly depending on how your code was generated. Adjust to match your repo.

---

## Getting Started

### Prerequisites

- Python 3.11 – 3.13 (very new versions may lack package support)
- Node.js 18+ (LTS) and npm
- Git

### 1. Clone

```bash
git clone https://github.com/YOUR_USERNAME/hiremind.git
cd hiremind
```

### 2. Backend

```bash
cd backend
py -m venv .venv                 # Windows (use python3 on macOS/Linux)
.venv\Scripts\activate           # macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
copy .env.example .env           # macOS/Linux: cp .env.example .env
uvicorn app.main:app --reload
```

- API: http://localhost:8000
- Interactive docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

The database tables and the 60+ sample jobs are created automatically on first startup.

### 3. Frontend (second terminal)

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173.

> Keep both terminals running. The backend is Python (`pip`, `uvicorn`); the frontend is Node (`npm`). Never run `npm` inside `backend/`.

---

## Environment Variables

### `backend/.env`

| Variable | Description | Example |
|---|---|---|
| `SECRET_KEY` | Secret used to sign JWTs | `change-me-to-a-long-random-string` |
| `ALGORITHM` | JWT algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token lifetime | `60` |
| `DATABASE_URL` | Database connection | `sqlite:///./hiremind.db` |
| `FRONTEND_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |
| `GROQ_API_KEY` | Optional, for the AI assistant | `gsk_...` |

### `frontend/.env`

| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend base URL | `http://localhost:8000` |

Never commit `.env` files. Only commit the `.env.example` templates.

---

## API Reference

All routes except `/auth/*` and `/health` require `Authorization: Bearer <token>`.

### Auth and Profile

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Create account (with profile fields) |
| POST | `/auth/login` | Log in, returns JWT |
| GET | `/me` | Current user |
| GET | `/profile` | Get profile |
| PUT | `/profile` | Update skills, level, location, work mode |

### Jobs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/jobs` | List jobs. Query: `q`, `location`, `work_mode`, `experience_level`, `page`, `limit` |
| GET | `/jobs/{id}` | Job details with match breakdown |
| GET | `/recommendations` | Top matches for the current user |

### Saved Jobs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/jobs/{id}/save` | Save a job |
| DELETE | `/jobs/{id}/save` | Remove a saved job |
| GET | `/saved` | List saved jobs |

### Assistant (Optional)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/assistant/chat` | Chat with the job assistant |

### System

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Server health check |

---

## Database Schema

| Table | Key Columns |
|---|---|
| `users` | id, email, hashed_password, created_at |
| `profiles` | id, user_id, experience_level, location, work_mode |
| `skills` | id, profile_id, name |
| `jobs` | id, title, company, description, location, work_mode, experience_level, skills, apply_url |
| `saved_jobs` | id, user_id, job_id, status, notes, created_at |

---

## Testing

```bash
cd backend
pytest -v
```

Covered:

- Match score math (full match, partial match, no match)
- Skill normalization (case and whitespace)
- Experience and preference fit
- 🟡 Auth and cross-user access (if added)

---

## Deployment

### Backend on Render

1. Push the repo to GitHub.
2. Create a **Web Service** on Render, root directory `backend`.
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add the environment variables from the table above.
6. Set `FRONTEND_ORIGIN` to your Vercel URL.

> SQLite resets on free hosting when the service restarts. For persistent data, use a hosted Postgres database and update `DATABASE_URL`.

### Frontend on Vercel

1. Import the repo, root directory `frontend`.
2. Framework preset: **Vite**.
3. Set `VITE_API_URL` to your Render backend URL.
4. Deploy.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `Failed to fetch` on login/register | Backend is not running, or CORS / API URL is wrong. Check `http://localhost:8000/health` |
| `localhost refused to connect` | The server is not started. Run uvicorn / `npm run dev` and keep the terminal open |
| `Python was not found` | Install Python and tick "Add to PATH", or use `py` on Windows |
| `.venv\Scripts\activate` not found | Create it first with `py -m venv .venv`, inside `backend/` |
| `npm ENOENT package.json` | You ran npm in `backend/`. Use `frontend/` |
| PowerShell blocks activate script | Run `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| `pip install` fails on a new Python | Use Python 3.12 or 3.13 |
| Frontend on port 5174 gets CORS errors | Stop the old process or add that port to allowed origins |

---

## Roadmap

- [ ] Resume upload with automatic skill extraction
- [ ] Semantic search with embeddings
- [ ] Skill-gap learning recommendations
- [ ] Email notifications and weekly job digests
- [ ] Application tracking board (Kanban)
- [ ] OAuth login (Google, GitHub)
- [ ] Recruiter view for posting jobs
- [ ] Live job feeds from public APIs
- [ ] GitHub Actions CI (lint, test, build)
- [ ] Docker setup

---

## Author

**Your Name**: B.E. Computer Science and Engineering (3rd year)
· LinkedIn: www.linkedin.com/in/raunakkhan
