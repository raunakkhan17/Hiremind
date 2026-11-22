from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Job, User
from app.schemas import JobResponse
from app.routes.auth import get_current_user
from app.matcher import calculate_match

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


@router.get("", response_model=List[JobResponse], summary="Get AI-matched job recommendations for current user")
def get_recommendations(
    limit: int = Query(10, ge=1, le=50, description="Maximum number of recommendations to return"),
    min_score: float = Query(0.0, ge=0.0, le=100.0, description="Minimum match score threshold"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Computes candidate-job match score across all listings for the authenticated user's profile.
    Returns listings ranked from highest to lowest match score.
    """
    if not current_user.profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User profile not found. Please complete your profile with skills and preferences first.",
        )

    all_jobs = db.query(Job).all()
    scored_jobs = []

    for job in all_jobs:
        match_info = calculate_match(current_user.profile, job)
        score = match_info["match_score"]

        if score >= min_score:
            scored_jobs.append(
                JobResponse(
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
                    match_score=score,
                    matched_skills=match_info["matched_skills"],
                    missing_skills=match_info["missing_skills"],
                    reasons=match_info["reasons"],
                )
            )

    # Rank by match_score descending
    scored_jobs.sort(key=lambda j: (j.match_score or 0.0), reverse=True)
    return scored_jobs[:limit]
