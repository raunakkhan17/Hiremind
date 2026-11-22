from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import Base, engine
from app.routes.health import router as health_router
from app.routes.auth import router as auth_router
from app.routes.jobs import router as jobs_router
from app.routes.saved import router as saved_router
from app.routes.recommendations import router as recommendations_router
from app.seed import seed_jobs

# Import models so Base.metadata knows about all entities
import app.models  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure SQLite tables exist
    Base.metadata.create_all(bind=engine)
    # Safe SQLite column migration for status in saved_jobs if table already exists
    try:
        from sqlalchemy import text
        with engine.connect() as conn:
            conn.execute(text("ALTER TABLE saved_jobs ADD COLUMN status VARCHAR(50) DEFAULT 'Saved'"))
            conn.commit()
    except Exception:
        pass
    # Automatically seed job listings from CSV without duplicates
    seed_jobs()
    yield
    # Shutdown actions if any


app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for HireMind talent intelligence platform with Candidate Matching & Recommendations",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS (specifically localhost:5173 and configured origins)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(recommendations_router)
app.include_router(jobs_router)
app.include_router(saved_router)


@app.get("/", summary="Root Endpoint")
def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs_url": "/docs",
        "health_check": "/health",
        "auth_endpoints": {
            "register": "POST /auth/register",
            "login": "POST /auth/login",
            "me": "GET /me",
        },
        "job_endpoints": {
            "list": "GET /jobs (q, location, work_mode, experience_level, page, limit) [includes match_score when authenticated]",
            "get_by_id": "GET /jobs/{id}",
            "save_job": "POST /jobs/{id}/save",
            "unsave_job": "DELETE /jobs/{id}/save",
            "saved_jobs": "GET /saved",
            "recommendations": "GET /recommendations",
        },
    }
