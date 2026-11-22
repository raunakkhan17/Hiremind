# HireMind

Full-stack hiring intelligence platform featuring **FastAPI**, **SQLite (via SQLAlchemy)**, **JWT Authentication**, **Automated CSV Job Seeding**, **Candidate-Job Match Scoring Engine**, **React**, **TypeScript**, **Vite**, **Professional SaaS Design System**, **Tailwind CSS**, **React Router**, and **Lucide Icons**.

---

## Frontend Architecture

### 1. Split-Layout Authentication Pages
- **Routes:** `/login` and `/register`
- **Left Panel (Gradient Branding):**
  - High-impact SaaS visual panel with deep indigo/violet ambient gradients and blur orbs.
  - Value propositions: 60% skill coverage + 20% experience fit + 20% preference fit matching engine.
  - Real-time match score preview card with skills checklist.
- **Right Panel (Interactive Forms):**
  - **Inline Validation:** Validates email regex, min-length password, and required skills on change & blur.
  - **Loading States:** Button spinner, disabled inputs during network submission.
  - **Toast Notifications:** Automatic feedback for validation warnings, error toasts on failure, and welcome toasts on success.
  - Seamless navigation links between `/login` and `/register`.

### 2. Centralized API Service Layer (`frontend/src/services/api.ts`)
- Configured base URL (`VITE_API_URL || 'http://localhost:8000'`).
- Automatically intercepts and injects `Authorization: Bearer <token>` from `localStorage`.
- Automatically clears expired tokens on `401 Unauthorized` responses.
- Structured endpoints:
  - `api.auth.login(credentials)`
  - `api.auth.register(payload)`
  - `api.auth.getMe()`
  - `api.jobs.list(params)`
  - `api.jobs.getById(id)`
  - `api.jobs.save(id)`
  - `api.jobs.unsave(id)`
  - `api.jobs.getSaved()`
  - `api.jobs.getRecommendations(params)`
  - `api.health.check()`

### 3. Protected Routes (`frontend/src/components/ProtectedRoute.tsx`)
- Guard component that verifies user authentication status before granting access.
- Redirects unauthenticated visitors to `/login`, storing the originating route in `location.state.from` for post-login return.
- **Protected Pages:** `/saved` (`SavedJobsPage.tsx` for shortlisting opportunities).

### 4. Design System & Components (`frontend/src/components/ui/`)
- **Theme:** Indigo primary (`brand`), Slate neutrals, Inter typography, and `rounded-xl` geometry.
- **Components:** `Button`, `Input`, `Card`, `Badge`, `Skeleton`, `Modal`, `Toast`, `EmptyState`.
- **Navbar:** Desktop navigation, theme toggle (Dark/Light mode with `localStorage` persistence), responsive mobile drawer, and user profile avatar menu.

---

## Candidate Match Engine (`backend/app/matcher.py`)

Pure functional scoring formula:
$$\text{score} = 0.6 \times \text{skill\_coverage} + 0.2 \times \text{experience\_fit} + 0.2 \times \text{preference\_fit}$$

- **`skill_coverage`** ($0.0 - 1.0$): Case-insensitive normalized set matching.
- **`experience_fit`** ($0.0 - 1.0$): Seniority comparison (`Entry`, `Mid`, `Senior`, `Lead`).
- **`preference_fit`** ($0.0 - 1.0$): Work mode (`Remote`, `Hybrid`, `On-site`) and location alignment.
- **Output:** `match_score` ($0-100$), `matched_skills`, `missing_skills`, and explanatory `reasons`.

---

## How to Run

### Backend (FastAPI + SQLite)
```bash
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1    # On Windows PowerShell (or: source venv/bin/activate on Unix)
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

- **Frontend App:** [http://localhost:5173](http://localhost:5173)
- **Login Page:** [http://localhost:5173/login](http://localhost:5173/login)
- **Register Page:** [http://localhost:5173/register](http://localhost:5173/register)
- **Protected Saved Jobs:** [http://localhost:5173/saved](http://localhost:5173/saved)
