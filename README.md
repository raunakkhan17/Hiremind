# HireMind

Full-stack hiring intelligence platform starter featuring **FastAPI**, **SQLite (via SQLAlchemy)**, **JWT Authentication**, **Automated CSV Job Seeding**, **Candidate-Job Match Scoring Engine**, **React**, **TypeScript**, **Vite**, **Tailwind CSS**, **React Router**, and **Lucide Icons**.

---

## Candidate Match Engine (`backend/app/matcher.py` & `backend/matcher.py`)

A pure functional matching engine that calculates compatibility between a candidate profile and a job listing.

### Formula
$$\text{score} = 0.6 \times \text{skill\_coverage} + 0.2 \times \text{experience\_fit} + 0.2 \times \text{preference\_fit}$$

- **`skill_coverage`** ($0.0 - 1.0$):
  - Normalizes candidate and job skills to lowercase and strips whitespace.
  - Matches candidate skills against job requirements:
    $$\text{skill\_coverage} = \frac{|\text{matched\_skills}|}{|\text{job\_skills}|}$$
- **`experience_fit`** ($0.0 - 1.0$):
  - Maps seniority levels (`Entry`, `Mid`, `Senior`, `Lead`, etc.) to numeric ranks.
  - Awards $1.0$ for exact matches, $0.9$ for higher qualification, and penalizes seniority shortfalls.
- **`preference_fit`** ($0.0 - 1.0$):
  - Evaluates work mode compatibility (`Remote`, `Hybrid`, `On-site`) and geographic location.
  - Fully compatible ($1.0$) for remote roles.

### Output
The function returns a dictionary:
```json
{
  "match_score": 85.0,
  "skill_coverage": 0.75,
  "experience_fit": 1.0,
  "preference_fit": 1.0,
  "matched_skills": ["python", "fastapi", "docker"],
  "missing_skills": ["kubernetes"],
  "reasons": [
    "75% skills match: matched 3/4 (python, fastapi, docker)",
    "Missing skills: kubernetes",
    "Exact experience level match (Senior)",
    "Remote position fits candidate preference"
  ]
}
```

---

## API Endpoints

### 1. Match Recommendations (`GET /recommendations`)
Returns job listings ranked in descending order of compatibility for the authenticated candidate:
- **Authentication:** Required (`Authorization: Bearer <token>`)
- **Query Parameters:** `limit` (default: 10), `min_score` (default: 0.0)
- **Example Request:**
  ```bash
  curl -X GET "http://localhost:8000/recommendations?limit=5" \
    -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
  ```

### 2. Job Catalog (`GET /jobs`)
- **Path:** `/jobs`
- **Query Parameters:** `q`, `location`, `work_mode`, `experience_level`, `page`, `limit`
- **Match Score Integration:** When called with an `Authorization: Bearer <token>` header belonging to a user with a profile, each returned job automatically includes `match_score`, `matched_skills`, `missing_skills`, and `reasons`. When unauthenticated, these fields are `null`.
- **Example Request:**
  ```bash
  curl "http://localhost:8000/jobs?q=python&work_mode=Remote&page=1&limit=5" \
    -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>"
  ```

### 3. Job Details (`GET /jobs/{id}`)
- Returns specific job. If user is authenticated with a profile, includes match score and breakdown.

### 4. Saved Jobs
- `POST /jobs/{id}/save`: Bookmark a job for the logged-in user.
- `DELETE /jobs/{id}/save`: Remove a bookmarked job.
- `GET /saved`: Retrieve all bookmarked jobs for the logged-in user.

### 5. Authentication
- `POST /auth/register`: Create user with profile & skills, returns JWT token.
- `POST /auth/login`: Authenticate and receive JWT token.
- `GET /me`: Get current user, profile details, and skills.

---

## Running Automated Tests

Pytest test suite is located at `backend/tests/test_matcher.py` covering:
- Exact 100% matches
- Partial skill matches and case-insensitive normalization
- Zero-skill matches
- Seniority/experience level differences
- Work mode & location preference scoring
- Edge cases (empty skills, missing preferences)

Run tests with:
```bash
cd backend
pytest tests/test_matcher.py -v
```

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

Visit [http://localhost:5173/jobs](http://localhost:5173/jobs) to test the live job search, filtering, pagination, match scoring, and bookmarking.
