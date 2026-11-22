from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Health Check Endpoint")
def health_check(db: Session = Depends(get_db)):
    """
    Performs a system health check, verifying FastAPI application
    and SQLite database connectivity via SQLAlchemy.
    """
    db_status = "healthy"
    db_error = None

    try:
        # Lightweight probe query to verify SQLite connection
        db.execute(text("SELECT 1"))
    except Exception as exc:
        db_status = "unhealthy"
        db_error = str(exc)

    is_healthy = db_status == "healthy"

    response_content = {
        "status": "healthy" if is_healthy else "degraded",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "services": {
            "api": "healthy",
            "database": {
                "type": "sqlite",
                "status": db_status,
                **({"error": db_error} if db_error else {}),
            },
        },
    }

    status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=status_code, content=response_content)
