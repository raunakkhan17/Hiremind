# HireMind

Full-stack hiring intelligence platform featuring **FastAPI**, **SQLite (via SQLAlchemy)**, **JWT Authentication**, **Automated CSV Job Seeding**, **Candidate-Job Match Scoring Engine**, **3-Step Onboarding Wizard**, **Candidate Profile Management**, **React**, **TypeScript**, **Vite**, **Professional SaaS Design System**, **Tailwind CSS**, **React Router**, and **Lucide Icons**.

---

## 3-Step Onboarding Wizard (`/onboarding`)

A guided onboarding experience featuring a progress bar (Step 1 of 3: 33% &rarr; 66% &rarr; 100%) to calibrate candidate compatibility:

1. **Step 1: Technical Stack & Skills:**
   - Interactive tag chips with remove button (`X`).
   - Custom skill input with Enter key or button submission.
   - Popular technology suggestions palette (Python, FastAPI, React, Docker, Kubernetes, etc.) to toggle chips with 1 click.
2. **Step 2: Seniority & Location:**
   - Visual cards for seniority levels (`Entry`, `Mid`, `Senior`, `Lead / Staff`) with descriptions and target experience ranges.
   - Primary location input with quick preset pills (`Remote`, `San Francisco, CA`, `New York, NY`, etc.).
3. **Step 3: Work Mode Preference:**
   - Arrangement cards: `Remote` (100% remote), `Hybrid` (office + home), and `On-site`.
   - Explains the 20% preference weighting in the candidate matching engine.
4. **Completion:**
   - Persists calibration to the backend via `PUT /profile`.
   - Fires success toast and redirects candidate to `/jobs` with instant live match scores.

---

## Candidate Profile Management (`/profile`)

A dedicated protected page for reviewing and modifying candidate preferences at any time:
- **Candidate Overview:** Initials avatar, verified email, registration status, and shortcut to saved opportunities.
- **Engine Breakdown Card:** Displays the live weighting of the matching algorithm (60% Skill Coverage + 20% Experience + 20% Work Mode/Location).
- **Interactive Form:**
  - Technical skills chip management with live suggestions.
  - Seniority level selector cards.
  - Work mode preference cards.
  - Location input with preset shortcuts.
- **Save Actions:** Updates backend profile via `api.auth.updateProfile()` with loading indicator and toast feedback.

---

## Candidate Match Engine (`backend/app/matcher.py`)

Pure functional scoring formula:
$$\text{score} = 0.6 \times \text{skill\_coverage} + 0.2 \times \text{experience\_fit} + 0.2 \times \text{preference\_fit}$$

- **`skill_coverage`** ($0.0 - 1.0$): Case-insensitive normalized set matching.
- **`experience_fit`** ($0.0 - 1.0$): Seniority comparison (`Entry`, `Mid`, `Senior`, `Lead`).
- **`preference_fit`** ($0.0 - 1.0$): Work mode (`Remote`, `Hybrid`, `On-site`) and location alignment.
- **Output:** `match_score` ($0-100$), `matched_skills`, `missing_skills`, and explanatory `reasons`.

---

## API Endpoints

### 1. Candidate Profile & Authentication
- `POST /auth/register`: Register user with profile and skills
- `POST /auth/login`: Authenticate and receive JWT token
- `GET /me`: Get authenticated user profile & skills
- `PUT /profile`: Update authenticated candidate's skills, experience, location, and work mode

### 2. Job Catalog & Matching
- `GET /jobs`: Filter and paginate jobs (`q`, `location`, `work_mode`, `experience_level`, `page`, `limit`) with dynamic candidate match scores
- `GET /jobs/{id}`: Detailed job view
- `GET /recommendations`: Job listings ranked in descending order of compatibility for the candidate

### 3. Saved Jobs
- `POST /jobs/{id}/save`: Bookmark a job for the logged-in user
- `DELETE /jobs/{id}/save`: Remove a bookmarked job
- `GET /saved`: List all bookmarked jobs for the logged-in user

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
- **Calibration Wizard:** [http://localhost:5173/onboarding](http://localhost:5173/onboarding)
- **Profile Management:** [http://localhost:5173/profile](http://localhost:5173/profile)
- **Saved Roles Queue:** [http://localhost:5173/saved](http://localhost:5173/saved)
