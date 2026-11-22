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
- **AI Career Assistant:** [http://localhost:5173/assistant](http://localhost:5173/assistant)
- **Role Search & Filters:** [http://localhost:5173/search](http://localhost:5173/search)
- **Job Details View:** [http://localhost:5173/jobs/1](http://localhost:5173/jobs/1)
- **Calibration Wizard:** [http://localhost:5173/onboarding](http://localhost:5173/onboarding)
- **Profile Manager:** [http://localhost:5173/profile](http://localhost:5173/profile)
- **Saved Pipeline & Application Tracker:** [http://localhost:5173/saved](http://localhost:5173/saved)

---

## AI Career Assistant (`POST /assistant/chat` & `/assistant`)

Interactive conversational career advisor powered by the **Groq API** (`llama-3.3-70b-versatile`):
- **Autonomous Tool Calling (Strictly 2 Backend Tools):**
  1. `search_jobs`: Queries SQLite database by keywords, location, work mode, and experience tier; dynamically calculates compatibility scores against the authenticated user's profile.
  2. `get_skill_gaps`: Analyzes skill alignment for a given `job_id`, returning matched skills, missing skills, and scoring reasons.
- **Security & Scoping:** The candidate identity is extracted directly from the session JWT token (`current_user`), **never** from LLM parameters.
- **Safety & Rate Limit Guards:** Enforces a maximum of **3 tool calls per turn**.
- **Friendly Fallback:** Gracefully recovers if the Groq API key is unconfigured, rate-limited, or encounters network failure, providing intelligent offline keyword matching and guidance without failing.
- **Frontend Chat Interface:**
  - **Message Bubbles:** Tailored user bubbles (indigo) and assistant responses (slate-900) with timestamp and tool-call indicators.
  - **Typing Indicator:** Animated 3-dot pulse with status indicator while the model queries backend tools.
  - **Clickable Job Cards:** Any jobs referenced during tool execution render as interactive cards inside replies with company avatars, work-mode badges, circular match rings, direct `/jobs/:id` links, and external apply buttons.
  - **Starter Prompts:** Quick suggestion chips for instant exploration.

---

## Job Details Page (`/jobs/:id`)

Two-column layout designed for deep candidate evaluation:
- **Main Column:**
  - Company branding avatar, role title, seniority badge, work arrangement badge, and posting date.
  - Action bar with prominent **"Apply Now"** button (pointing to external URL), single-click **Bookmark** toggle, and **Share link** button with clipboard feedback.
  - Complete formatted job description.
  - Required technologies & competencies with matching indicator chips.
- **Side Column (Match Breakdown):**
  - **Large Circular Match Ring (`CircularProgress`):** Prominently displays the total compatibility score calculated by the scoring formula:
    `score = 0.6 * skill_coverage + 0.2 * experience_fit + 0.2 * preference_fit`
  - **Score Formula Breakdown:** Quick metrics for Skills (60%), Experience (20%), and Work Mode (20%).
  - **Matched Skills:** Green chips (`bg-emerald-950/70 text-emerald-300 border-emerald-500/50`) with checkmark icons.
  - **Missing Skills / Skills to Acquire:** Red/amber chips (`bg-rose-950/60 text-rose-300 border-rose-500/40`) identifying skill gaps.
  - **Scoring Rationale:** Bulleted list of reasons explaining exactly why the candidate matches or where gaps exist.
  - Role snapshot card with location, work arrangement, and recruiting pipeline status.

---

## Saved Jobs & Application Pipeline (`/saved`)

Personal application tracking system:
- **Pipeline Stage Filter Tabs:** Filter jobs by `All`, `Saved`, `Applied`, `Interview`, and `Rejected` with live count badges.
- **Status Dropdown:** Update any tracked role's lifecycle state directly on the card with color-coded badges (`Saved`, `Applied`, `Interview`, `Rejected`).
- **Remove Button:** One-click removal with confirmation toast and immediate list update.
- **External Apply Button:** Direct link to job application portals.

---

## Landing Page, UX & Accessibility

- **Hero Section (`/`):** High-converting SaaS hero with gradient title, platform value proposition, dynamic call-to-actions ("Explore Live Roles", "Calibrate My Profile", "Ask AI Assistant"), live metric badges (60+ Roles, 3-Factor Match, <100ms Pure Scoring, LLaMA 3.3 Groq Engine), and an interactive glass match preview card.
- **3 Feature Cards:**
  1. *Deterministic 3-Factor Scoring*: Mathematical formula breakdown (60% Skill Coverage, 20% Seniority Fit, 20% Preference Fit).
  2. *Autonomous AI Career Advisor*: Groq LLaMA 3.3 with dual-tool calling (`search_jobs`, `get_skill_gaps`) and JWT token-scoped privacy.
  3. *Lifecycle Opportunity Tracker*: Pipeline tracking with visual stage indicators (`Saved`, `Applied`, `Interview`, `Decisions`).
- **Call-to-Action (CTA):** Prominent gradient banner with direct profile calibration button and trust guarantees.
- **Error Boundary (`ErrorBoundary.tsx`):** Gracefully catches unhandled runtime render exceptions with a friendly recovery interface, reload button, and collapsible diagnostics.
- **Page Transitions & Animations:** Smooth CSS entrance keyframes (`animate-fade-in`, `animate-slide-up`, `page-enter`), subtle glows, and responsive transitions.
- **Accessible 404 Page (`NotFoundPage.tsx`):** Visual glow 404 badge, descriptive recovery instructions, and quick destination links (Home, Catalog, Assistant, Dashboard).
- **Custom SVG Favicon (`/favicon.svg`):** Sleek, brand-aligned vector icon linked in `index.html`.
- **Accessibility & Mobile Layouts:** Comprehensive keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`), WCAG AA contrast compliance, explicit `aria-label` tags, and fully collapsible mobile filter and navigation drawers.
