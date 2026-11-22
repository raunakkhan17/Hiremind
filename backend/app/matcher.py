from typing import Any, Dict, List, Optional, Set, Union

EXP_LEVEL_MAP: Dict[str, int] = {
    "intern": 0,
    "entry": 1,
    "junior": 1,
    "associate": 1,
    "mid": 2,
    "intermediate": 2,
    "senior": 3,
    "lead": 4,
    "staff": 4,
    "principal": 5,
}


def _normalize_skill(skill: str) -> str:
    """Normalizes a single skill string to lowercase and trims whitespace."""
    return skill.strip().lower()


def _parse_skills(skills_input: Any) -> List[str]:
    """
    Extracts and normalizes skills from diverse input shapes:
    - Comma-separated string: "Python, React, TypeScript"
    - List of strings: ["Python", "React"]
    - List of objects/dicts with 'name': [{'name': 'Python'}] or Skill models
    """
    if not skills_input:
        return []

    parts: List[str] = []
    if isinstance(skills_input, str):
        parts = skills_input.split(",")
    elif isinstance(skills_input, (list, tuple, set)):
        for item in skills_input:
            if isinstance(item, str):
                parts.append(item)
            elif hasattr(item, "name") and getattr(item, "name"):
                parts.append(str(getattr(item, "name")))
            elif isinstance(item, dict) and "name" in item:
                parts.append(str(item["name"]))
    else:
        return []

    normalized: List[str] = []
    seen: Set[str] = set()
    for raw in parts:
        clean = _normalize_skill(raw)
        if clean and clean not in seen:
            seen.add(clean)
            normalized.append(clean)
    return normalized


def _get_field(obj: Any, field_name: str, fallback: Any = None) -> Any:
    """Safely extracts a field from either a dictionary or object attribute."""
    if obj is None:
        return fallback
    if isinstance(obj, dict):
        return obj.get(field_name, fallback)
    return getattr(obj, field_name, fallback)


def calculate_match(
    candidate: Any = None,
    job: Any = None,
    *,
    candidate_skills: Optional[Union[List[str], str]] = None,
    job_skills: Optional[Union[List[str], str]] = None,
    candidate_experience: Optional[str] = None,
    job_experience: Optional[str] = None,
    candidate_work_mode: Optional[str] = None,
    job_work_mode: Optional[str] = None,
    candidate_location: Optional[str] = None,
    job_location: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Pure function that calculates candidate-job match score.

    Formula:
        score = 0.6 * skill_coverage + 0.2 * experience_fit + 0.2 * preference_fit
        each sub-score normalized between 0.0 and 1.0.

    Returns:
        dict containing:
            - match_score: float (0.0 to 100.0)
            - skill_coverage: float (0.0 to 1.0)
            - experience_fit: float (0.0 to 1.0)
            - preference_fit: float (0.0 to 1.0)
            - matched_skills: List[str] (normalized lowercase)
            - missing_skills: List[str] (normalized lowercase)
            - reasons: List[str] (short explanatory summary points)
    """
    # 1. Resolve Candidate attributes
    c_skills_raw = candidate_skills if candidate_skills is not None else _get_field(candidate, "skills")
    c_exp = candidate_experience if candidate_experience is not None else _get_field(candidate, "experience_level")
    c_wm = candidate_work_mode if candidate_work_mode is not None else _get_field(candidate, "work_mode")
    c_loc = candidate_location if candidate_location is not None else _get_field(candidate, "location")

    # 2. Resolve Job attributes
    j_skills_raw = job_skills if job_skills is not None else _get_field(job, "skills")
    j_exp = job_experience if job_experience is not None else _get_field(job, "experience_level")
    j_wm = job_work_mode if job_work_mode is not None else _get_field(job, "work_mode")
    j_loc = job_location if job_location is not None else _get_field(job, "location")

    # 3. Calculate Skill Coverage (0.0 - 1.0)
    c_skills = _parse_skills(c_skills_raw)
    j_skills = _parse_skills(j_skills_raw)
    c_skills_set = set(c_skills)

    matched_skills = [s for s in j_skills if s in c_skills_set]
    missing_skills = [s for s in j_skills if s not in c_skills_set]

    if not j_skills:
        skill_coverage = 1.0
    else:
        skill_coverage = len(matched_skills) / len(j_skills)
    skill_coverage = max(0.0, min(1.0, skill_coverage))

    # 4. Calculate Experience Fit (0.0 - 1.0)
    c_exp_norm = str(c_exp).strip().lower() if c_exp else None
    j_exp_norm = str(j_exp).strip().lower() if j_exp else None

    c_rank = EXP_LEVEL_MAP.get(c_exp_norm) if c_exp_norm else None
    j_rank = EXP_LEVEL_MAP.get(j_exp_norm) if j_exp_norm else None

    if c_rank is None or j_rank is None:
        experience_fit = 0.7  # Neutral default when experience is unstated
        exp_reason = "Experience requirements flexible or unstated"
    else:
        diff = c_rank - j_rank
        if diff == 0:
            experience_fit = 1.0
            exp_reason = f"Exact experience level match ({c_exp})"
        elif diff == 1:
            experience_fit = 0.9
            exp_reason = f"Strong qualification match ({c_exp} for {j_exp} role)"
        elif diff > 1:
            experience_fit = 0.75
            exp_reason = f"Candidate experience exceeds role requirement ({c_exp} vs {j_exp})"
        elif diff == -1:
            experience_fit = 0.5
            exp_reason = f"Growth opportunity: 1 level below requirement ({c_exp} vs {j_exp})"
        else:
            experience_fit = 0.2
            exp_reason = f"Candidate below required seniority level ({c_exp} vs {j_exp})"

    experience_fit = max(0.0, min(1.0, experience_fit))

    # 5. Calculate Preference Fit (0.0 - 1.0)
    c_wm_norm = str(c_wm).strip().lower() if c_wm else None
    j_wm_norm = str(j_wm).strip().lower() if j_wm else None
    c_loc_norm = str(c_loc).strip().lower() if c_loc else None
    j_loc_norm = str(j_loc).strip().lower() if j_loc else None

    # Work mode scoring
    if not c_wm_norm or c_wm_norm in ("all", "any"):
        wm_score = 1.0
        wm_reason = "Open to all work modes"
    elif j_wm_norm == "remote":
        wm_score = 1.0
        wm_reason = "Remote position fits candidate preference"
    elif c_wm_norm == j_wm_norm:
        wm_score = 1.0
        wm_reason = f"Work mode match ({j_wm})"
    elif c_wm_norm == "remote" and j_wm_norm == "on-site":
        wm_score = 0.0
        wm_reason = "Work mode mismatch (Candidate prefers Remote, Job is On-site)"
    elif c_wm_norm == "remote" and j_wm_norm == "hybrid":
        wm_score = 0.4
        wm_reason = "Partial work mode alignment (Candidate prefers Remote, Job is Hybrid)"
    elif c_wm_norm == "hybrid" and j_wm_norm == "on-site":
        wm_score = 0.6
        wm_reason = "Acceptable work mode overlap (Hybrid candidate with On-site job)"
    else:
        wm_score = 0.5
        wm_reason = f"Work mode differs ({c_wm} vs {j_wm})"

    # Location scoring
    if j_wm_norm == "remote" or c_wm_norm == "remote":
        loc_score = 1.0
        loc_reason = "Remote eligibility removes location barrier"
    elif not c_loc_norm or not j_loc_norm:
        loc_score = 0.9
        loc_reason = "Location unconstrained"
    elif c_loc_norm in j_loc_norm or j_loc_norm in c_loc_norm:
        loc_score = 1.0
        loc_reason = f"Location matched ({j_loc})"
    else:
        loc_score = 0.2
        loc_reason = f"Different locations ({c_loc} vs {j_loc})"

    if j_wm_norm == "remote":
        preference_fit = 1.0
    else:
        preference_fit = 0.6 * wm_score + 0.4 * loc_score

    preference_fit = max(0.0, min(1.0, preference_fit))

    # 6. Overall Weighted Score Calculation
    raw_score = 0.6 * skill_coverage + 0.2 * experience_fit + 0.2 * preference_fit
    match_score = round(max(0.0, min(100.0, raw_score * 100)), 1)

    # 7. Generate concise reasons
    reasons: List[str] = []
    if j_skills:
        pct = int(skill_coverage * 100)
        if missing_skills:
            reasons.append(
                f"{pct}% skills match: matched {len(matched_skills)}/{len(j_skills)} ({', '.join(matched_skills[:3])})"
            )
            reasons.append(f"Missing skills: {', '.join(missing_skills[:3])}")
        else:
            reasons.append(f"100% skill match! All {len(j_skills)} required skills matched")
    else:
        reasons.append("No specific skills required by listing")

    reasons.append(exp_reason)
    reasons.append(wm_reason if j_wm_norm != "remote" else loc_reason)

    return {
        "match_score": match_score,
        "skill_coverage": round(skill_coverage, 2),
        "experience_fit": round(experience_fit, 2),
        "preference_fit": round(preference_fit, 2),
        "matched_skills": matched_skills,
        "missing_skills": missing_skills,
        "reasons": reasons,
    }


# Convenience alias matching functional naming
match_candidate_to_job = calculate_match
