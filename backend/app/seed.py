import csv
import logging
import os
import sys
from pathlib import Path
from typing import Optional

# Ensure project root is in python path when run standalone
current_dir = Path(__file__).resolve().parent
backend_dir = current_dir.parent
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

from app.database import SessionLocal, Base, engine
from app.models import Job

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("hiremind.seed")


def seed_jobs(csv_path: Optional[str | Path] = None) -> int:
    """
    Seeds job listings from a CSV file into the database without creating duplicates.
    Checks existing (title, company) pairs to guarantee idempotent runs.
    """
    if csv_path is None:
        csv_path = backend_dir / "data" / "jobs.csv"
    else:
        csv_path = Path(csv_path)

    if not csv_path.exists():
        logger.warning(f"Seed file not found at {csv_path}. Skipping job seeding.")
        return 0

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    added_count = 0
    try:
        # Load existing (title, company) pairs from the database to prevent duplicates
        existing_jobs = set(db.query(Job.title, Job.company).all())
        total_existing_before = len(existing_jobs)

        with open(csv_path, mode="r", encoding="utf-8") as f:
            reader = csv.DictReader(f)
            for row in reader:
                title = row.get("title", "").strip()
                company = row.get("company", "").strip()

                if not title or not company:
                    continue

                if (title, company) in existing_jobs:
                    continue

                job = Job(
                    title=title,
                    company=company,
                    description=row.get("description", "").strip() or None,
                    location=row.get("location", "").strip(),
                    work_mode=row.get("work_mode", "").strip() or "Remote",
                    experience_level=row.get("experience_level", "").strip() or "Mid",
                    skills=row.get("skills", "").strip() or None,
                    apply_url=row.get("apply_url", "").strip() or None,
                )
                db.add(job)
                existing_jobs.add((title, company))
                added_count += 1

        if added_count > 0:
            db.commit()
            logger.info(
                f"Successfully seeded {added_count} new job listings. (Total now: {total_existing_before + added_count})"
            )
        else:
            logger.info(
                f"Database already contains all {total_existing_before} jobs from CSV. No new jobs added."
            )

        return added_count
    except Exception as exc:
        db.rollback()
        logger.error(f"Error seeding jobs from CSV: {exc}", exc_info=True)
        raise exc
    finally:
        db.close()


if __name__ == "__main__":
    print(f"Loading jobs from {backend_dir / 'data' / 'jobs.csv'}...")
    new_jobs = seed_jobs()
    print(f"Seeding completed. Added: {new_jobs} jobs.")
