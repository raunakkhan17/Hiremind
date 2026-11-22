# HireMind

Full-stack hiring intelligence platform featuring **FastAPI**, **SQLite (via SQLAlchemy)**, **JWT Authentication**, **Automated CSV Job Seeding**, **Candidate-Job Match Scoring Engine**, **Interactive Dashboard**, **Advanced Search with Filter Sidebar**, **Circular Match-Score Rings**, **3-Step Onboarding Wizard**, **Candidate Profile Management**, **React**, **TypeScript**, **Vite**, **Professional SaaS Design System**, **Tailwind CSS**, **React Router**, and **Lucide Icons**.

---

## Interactive Dashboard (`/dashboard`)

A candidate command center featuring:
- **Welcome Header:** Personalized candidate welcome showing calibrated experience level, work mode, and quick calibration actions.
- **Stat Cards:**
  - **Saved Positions:** Current count of bookmarked opportunities with 1-click navigation to `/saved`.
  - **Top Match Score:** Peak compatibility percentage (e.g. `98%`) and associated role title.
  - **Active Pipeline:** 60 verified technical listings in the SQLite database.
  - **Calibrated Skills:** Active technical skill chips powering the 60% skill coverage scoring.
- **"Recommended for you" Section:**
  - Ranked job listings returned by `api.jobs.getRecommendations()`.
  - Rendered with rich `JobCard` components (see below).

---

## Search Page & Filter Sidebar (`/search` & `/jobs`)

A role discovery and filtering experience:
- **Primary Search Bar:** 250ms debounced full-text search across job titles, company names, technical skills, and descriptions with 1-click clear button.
- **Filter Sidebar:**
  - **Work Mode:** Radio selectors for `All`, `Remote`, `Hybrid`, and `On-site`.
  - **Seniority:** Filter by `Entry`, `Mid`, `Senior`, and `Lead`.
  - **Location:** City substring matching with popular quick-pick presets.
  - **Mobile Collapsible Drawer:** Automatically collapses into a drawer on compact viewports with an active filter badge counter.
- **Pagination & Skeletons:**
  - Configurable page limits (10, 20, 50 per page).
  - Shimmer pulse `SkeletonCard` placeholders during data loading.

---

## Enhanced Job Card (`JobCard.tsx`)

Each opportunity card includes:
1. **Company Initial Avatar:** Dynamic brand gradient icon featuring the company's capitalized initial (e.g. `C` for CloudScale AI).
2. **Title & Location:** Role title and verified city/remote status.
3. **Work-Mode Badge:** Color-coded status badge (`Remote`, `Hybrid`, `On-site`).
4. **Circular Match-Score Ring (`CircularProgress.tsx`):**
   - Animated SVG radial progress ring with color transitions:
     - **$\ge 80\%$ Match:** Emerald green ring with pulsing highlight
     - **$\ge 60\%$ Match:** Indigo blue ring
     - **$< 60\%$ Match:** Amber warning ring
   - Centered percentage and "Match" label.
5. **Bookmark Button:** Single-click save/unsave toggling with `localStorage` and backend persistence.
6. **Skills Chips:** Highlights matching skills in emerald with checkmarks and displays missing skills.

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

- **Candidate Dashboard:** [http://localhost:5173/dashboard](http://localhost:5173/dashboard)
- **Role Search & Filters:** [http://localhost:5173/search](http://localhost:5173/search)
- **Calibration Wizard:** [http://localhost:5173/onboarding](http://localhost:5173/onboarding)
- **Profile Manager:** [http://localhost:5173/profile](http://localhost:5173/profile)
- **Saved Opportunities:** [http://localhost:5173/saved](http://localhost:5173/saved)
