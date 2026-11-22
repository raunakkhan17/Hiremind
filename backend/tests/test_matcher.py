import pytest
from app.matcher import calculate_match


def test_perfect_match():
    candidate = {
        "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
        "experience_level": "Senior",
        "work_mode": "Remote",
        "location": "Remote",
    }
    job = {
        "skills": "python, fastapi, docker, postgresql",
        "experience_level": "Senior",
        "work_mode": "Remote",
        "location": "Remote",
    }

    result = calculate_match(candidate, job)

    assert result["match_score"] == 100.0
    assert result["skill_coverage"] == 1.0
    assert result["experience_fit"] == 1.0
    assert result["preference_fit"] == 1.0
    assert len(result["missing_skills"]) == 0
    assert len(result["matched_skills"]) == 4
    assert "fastapi" in result["matched_skills"]


def test_partial_skill_match_and_normalization():
    # Candidate with mixed casing and extra whitespace
    candidate_skills = ["  PYTHON ", "React", "TypeScript"]
    job_skills = "python, react, docker, aws"

    result = calculate_match(
        candidate_skills=candidate_skills,
        job_skills=job_skills,
        candidate_experience="Mid",
        job_experience="Mid",
        candidate_work_mode="Remote",
        job_work_mode="Remote",
    )

    # 2 out of 4 skills matched -> 0.5 skill coverage
    # experience: Mid vs Mid -> 1.0
    # preference: Remote vs Remote -> 1.0
    # Score = 0.6 * 0.5 + 0.2 * 1.0 + 0.2 * 1.0 = 0.3 + 0.2 + 0.2 = 0.7 -> 70.0
    assert result["match_score"] == 70.0
    assert result["skill_coverage"] == 0.5
    assert set(result["matched_skills"]) == {"python", "react"}
    assert set(result["missing_skills"]) == {"docker", "aws"}


def test_zero_skill_match():
    result = calculate_match(
        candidate_skills=["Java", "Spring Boot"],
        job_skills=["Python", "FastAPI", "SQLAlchemy"],
        candidate_experience="Mid",
        job_experience="Mid",
        candidate_work_mode="Remote",
        job_work_mode="Remote",
    )

    # skill_coverage = 0.0
    # exp = 1.0, pref = 1.0
    # Score = 0.6 * 0.0 + 0.2 * 1.0 + 0.2 * 1.0 = 0.4 -> 40.0
    assert result["skill_coverage"] == 0.0
    assert result["match_score"] == 40.0
    assert len(result["matched_skills"]) == 0
    assert len(result["missing_skills"]) == 3


def test_experience_mismatch_penalty():
    # Junior candidate applying for Lead role
    result = calculate_match(
        candidate_skills=["Python", "FastAPI"],
        job_skills=["Python", "FastAPI"],
        candidate_experience="Entry",
        job_experience="Lead",
        candidate_work_mode="Remote",
        job_work_mode="Remote",
    )

    # skill = 1.0 (0.6)
    # exp = 0.2 (2+ levels below) -> 0.2 * 0.2 = 0.04
    # pref = 1.0 -> 0.2 * 1.0 = 0.2
    # total = 0.6 + 0.04 + 0.2 = 0.84 -> 84.0
    assert result["skill_coverage"] == 1.0
    assert result["experience_fit"] == 0.2
    assert result["match_score"] == 84.0


def test_work_mode_mismatch():
    # Remote candidate applying for On-site role in another city
    result = calculate_match(
        candidate_skills=["Python"],
        job_skills=["Python"],
        candidate_experience="Senior",
        job_experience="Senior",
        candidate_work_mode="Remote",
        job_work_mode="On-site",
        candidate_location="New York, NY",
        job_location="San Francisco, CA",
    )

    # skill = 1.0 -> 0.6
    # exp = 1.0 -> 0.2
    # pref: wm_score = 0.0, loc_score = 0.2 -> pref_fit = 0.6*0 + 0.4*0.2 = 0.08
    # 0.2 * 0.08 = 0.016
    # score = 0.6 + 0.2 + 0.016 = 0.816 -> 81.6
    assert result["skill_coverage"] == 1.0
    assert result["experience_fit"] == 1.0
    assert result["preference_fit"] < 0.2
    assert result["match_score"] < 85.0
    assert any("mismatch" in r.lower() for r in result["reasons"])


def test_empty_job_skills_handled_gracefully():
    # When job specifies no specific skills
    result = calculate_match(
        candidate_skills=["Python", "React"],
        job_skills="",
        candidate_experience="Mid",
        job_experience="Mid",
        candidate_work_mode="Remote",
        job_work_mode="Remote",
    )

    assert result["skill_coverage"] == 1.0
    assert result["match_score"] == 100.0
    assert result["matched_skills"] == []
    assert result["missing_skills"] == []


def test_reasons_contain_relevant_feedback():
    result = calculate_match(
        candidate_skills=["Python"],
        job_skills=["Python", "Kafka"],
        candidate_experience="Mid",
        job_experience="Senior",
        candidate_work_mode="Remote",
        job_work_mode="Remote",
    )

    reasons = result["reasons"]
    assert len(reasons) >= 2
    # Should mention matched/missing skills
    combined = " ".join(reasons).lower()
    assert "kafka" in combined or "missing" in combined
