from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Job, SavedJob, User
from app.schemas import (
    JobResponse,
    PaginatedJobsResponse,
    SavedJobResponse,
    UnsaveResponse,
)
from app.routes.auth import get_current_user, get_optional_current_user
from app.matcher import calculate_match

router = APIRouter(prefix="/jobs", tags=["Jobs"])


def _job_to_response(job: Job, user_profile: Optional[object] = None) -> JobResponse:
    """Helper to convert a Job model instance into JobResponse, computing match if profile is provided."""
    match_info = None
    if user_profile:
        match_info = calculate_match(user_profile, job)

    return JobResponse(
        id=job.id,
        title=job.title,
        company=job.company,
        description=job.description,
        location=job.location,
        work_mode=job.work_mode,
        experience_level=job.experience_level,
        skills=job.skills,
        apply_url=job.apply_url,
        created_at=job.created_at,
        match_score=match_info["match_score"] if match_info else None,
        matched_skills=match_info["matched_skills"] if match_info else None,
        missing_skills=match_info["missing_skills"] if match_info else None,
        reasons=match_info["reasons"] if match_info else None,
    )


@router.get("", response_model=PaginatedJobsResponse, summary="List and filter jobs with pagination & candidate matching")
def list_jobs(
    response: Response,
    q: Optional[str] = Query(None, description="Search term for title, company, description, or skills"),
    location: Optional[str] = Query(None, description="Filter by location (e.g. Remote, San Francisco)"),
    work_mode: Optional[str] = Query(None, description="Filter by work mode: Remote, Hybrid, On-site"),
    experience_level: Optional[str] = Query(None, description="Filter by level: Entry, Mid, Senior, Lead"),
    page: int = Query(1, ge=1, description="Page number (1-based index)"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    optional_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """
    Retrieves job postings with keyword search (q), location, work_mode,
    experience_level, and page/limit pagination.
    Includes candidate match score when authenticated user has a profile.
    """
    query = db.query(Job)

    if q and q.strip():
        term = f"%{q.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(term),
                Job.company.ilike(term),
                Job.skills.ilike(term),
                Job.description.ilike(term),
            )
        )

    if location and location.strip():
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if work_mode and work_mode.strip() and work_mode.lower() != "all":
        query = query.filter(Job.work_mode.ilike(work_mode.strip()))

    if experience_level and experience_level.strip() and experience_level.lower() != "all":
        query = query.filter(Job.experience_level.ilike(experience_level.strip()))

    total = query.count()
    total_pages = (total + limit - 1) // limit if total > 0 else 1
    offset = (page - 1) * limit

    jobs_data = query.order_by(Job.id.asc()).offset(offset).limit(limit).all()

    # Determine user profile if available
    profile = optional_user.profile if (optional_user and optional_user.profile) else None

    # Transform jobs to JobResponse, augmenting with match score if profile exists
    items = [_job_to_response(job, profile) for job in jobs_data]

    # Provide pagination metadata in standard headers
    response.headers["X-Total-Count"] = str(total)
    response.headers["X-Page"] = str(page)
    response.headers["X-Limit"] = str(limit)
    response.headers["X-Total-Pages"] = str(total_pages)

    return PaginatedJobsResponse(
        items=items,
        jobs=items,
        total=total,
        page=page,
        limit=limit,
        total_pages=total_pages,
    )


@router.get("/saved", response_model=List[SavedJobResponse], summary="List saved jobs for current user")
def list_saved_jobs_in_jobs_router(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Retrieves all jobs bookmarked by the currently authenticated user."""
    return (
        db.query(SavedJob)
        .options(joinedload(SavedJob.job))
        .filter(SavedJob.user_id == current_user.id)
        .order_by(SavedJob.created_at.desc())
        .all()
    )


@router.get("/{id}", response_model=JobResponse, summary="Get single job by ID")
def get_job(
    id: int,
    optional_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
):
    """Fetches details for a specific job posting, including match score if user is logged in."""
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {id} not found",
        )

    profile = optional_user.profile if (optional_user and optional_user.profile) else None
    return _job_to_response(job, profile)


@router.post("/{id}/save", response_model=SavedJobResponse, summary="Save a job for the logged-in user")
def save_job(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Saves a job listing scoped to the authenticated user.
    If already saved, returns the existing record idempotently.
    """
    job = db.query(Job).filter(Job.id == id).first()
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Job with ID {id} not found",
        )

    existing = (
        db.query(SavedJob)
        .options(joinedload(SavedJob.job))
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == id)
        .first()
    )
    if existing:
        return existing

    new_saved = SavedJob(user_id=current_user.id, job_id=id)
    db.add(new_saved)
    db.commit()

    saved = (
        db.query(SavedJob)
        .options(joinedload(SavedJob.job))
        .filter(SavedJob.id == new_saved.id)
        .first()
    )
    return saved


@router.delete("/{id}/save", response_model=UnsaveResponse, summary="Unsave / delete a saved job for the logged-in user")
def unsave_job(
    id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Removes a job from the authenticated user's saved list.
    Scoped strictly to the logged-in user.
    """
    saved = (
        db.query(SavedJob)
        .filter(SavedJob.user_id == current_user.id, SavedJob.job_id == id)
        .first()
    )
    if not saved:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Saved job with ID {id} not found for this user",
        )

    db.delete(saved)
    db.commit()
    return UnsaveResponse(
        message=f"Job {id} successfully removed from saved list",
        job_id=id,
        saved=False,
    )
