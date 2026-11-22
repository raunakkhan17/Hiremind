from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import SavedJob, User
from app.schemas import SavedJobResponse
from app.routes.auth import get_current_user

router = APIRouter(prefix="/saved", tags=["Saved Jobs"])


@router.get("", response_model=List[SavedJobResponse], summary="Get saved jobs for logged-in user")
def get_user_saved_jobs(
    status: Optional[str] = Query(None, description="Filter by status: Saved, Applied, Interview, Rejected"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Returns all jobs bookmarked by the currently authenticated user.
    Scoped strictly to the logged-in user with optional status filter.
    """
    query = (
        db.query(SavedJob)
        .options(joinedload(SavedJob.job))
        .filter(SavedJob.user_id == current_user.id)
    )

    if status and status.strip() and status.lower() != "all":
        query = query.filter(SavedJob.status.ilike(status.strip()))

    return query.order_by(SavedJob.created_at.desc()).all()
