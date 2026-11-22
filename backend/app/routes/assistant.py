import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, status
import httpx
from sqlalchemy import or_
from sqlalchemy.orm import Session
from app.config import get_settings
from app.database import get_db
from app.models import Job, User
from app.schemas import ChatRequest, ChatResponse, JobResponse
from app.routes.auth import get_current_user
from app.routes.jobs import _job_to_response
from app.matcher import calculate_match

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/assistant", tags=["AI Assistant"])

# Tool schemas allowed for Groq API
GROQ_TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "search_jobs",
            "description": "Search live job listings in the HireMind database by query, location, work mode, and experience tier.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Keywords to match against title, company, description, or skills (e.g. 'python', 'react', 'fastapi', 'devops')",
                    },
                    "location": {
                        "type": "string",
                        "description": "Location to filter by (e.g. 'San Francisco', 'Remote', 'New York')",
                    },
                    "work_mode": {
                        "type": "string",
                        "enum": ["Remote", "Hybrid", "On-site"],
                        "description": "Work arrangement preference",
                    },
                    "experience_level": {
                        "type": "string",
                        "enum": ["Entry", "Mid", "Senior", "Lead"],
                        "description": "Experience / seniority level",
                    },
                    "limit": {
                        "type": "integer",
                        "description": "Maximum number of job listings to return (default: 4, max: 8)",
                    },
                },
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_skill_gaps",
            "description": "Evaluate skill alignment and identify missing skills for the current candidate against a specific job posting. NOTE: Candidate identity is derived securely from the authenticated session token, never from model parameters.",
            "parameters": {
                "type": "object",
                "properties": {
                    "job_id": {
                        "type": "integer",
                        "description": "The unique integer ID of the job posting to analyze",
                    }
                },
                "required": ["job_id"],
            },
        },
    },
]


def _build_system_prompt(current_user: User) -> str:
    profile = current_user.profile
    skills_list = [s.name for s in (profile.skills if profile else [])]
    skills_str = ", ".join(skills_list) if skills_list else "None specified yet"
    exp_level = profile.experience_level if (profile and profile.experience_level) else "Not set"
    loc = profile.location if (profile and profile.location) else "Not set"
    work_mode = profile.work_mode if (profile and profile.work_mode) else "Not set"

    return (
        "You are the HireMind AI Career Advisor, an intelligent assistant built into the HireMind platform. "
        "Your mission is to help candidates explore jobs, assess their match compatibility, and understand skill gaps.\n\n"
        "Guidelines:\n"
        "1. You may call at most two tools: `search_jobs` and `get_skill_gaps`. Never attempt to call any other tool.\n"
        "2. When the user asks about jobs, suitable roles, or recommendations, call `search_jobs`.\n"
        "3. When the user asks about their fit, compatibility, or what skills they are missing for a particular job, call `get_skill_gaps` with the job's ID.\n"
        "4. The candidate's identity and profile are securely linked via their authenticated JWT session. You only supply `job_id` to `get_skill_gaps`.\n"
        "5. Keep replies engaging, concise, and professional. Mention job titles and company names clearly. "
        "When recommending jobs, highlight key matched skills and advise on closing any missing skill gaps.\n\n"
        "Authenticated Candidate Context:\n"
        f"- Email: {current_user.email}\n"
        f"- Target Experience: {exp_level}\n"
        f"- Preferred Location: {loc}\n"
        f"- Preferred Work Mode: {work_mode}\n"
        f"- Profile Skills: {skills_str}\n"
    )


def _execute_search_jobs(
    args: Dict[str, Any],
    current_user: User,
    db: Session,
    referenced_jobs: Dict[int, JobResponse],
) -> List[Dict[str, Any]]:
    query = db.query(Job)
    q = args.get("query")
    location = args.get("location")
    work_mode = args.get("work_mode")
    experience_level = args.get("experience_level")
    limit = min(max(int(args.get("limit", 4)), 1), 8)

    if q and str(q).strip():
        term = f"%{str(q).strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(term),
                Job.company.ilike(term),
                Job.skills.ilike(term),
                Job.description.ilike(term),
            )
        )

    if location and str(location).strip():
        query = query.filter(Job.location.ilike(f"%{str(location).strip()}%"))

    if work_mode and str(work_mode).strip() and str(work_mode).lower() != "all":
        query = query.filter(Job.work_mode.ilike(str(work_mode).strip()))

    if experience_level and str(experience_level).strip() and str(experience_level).lower() != "all":
        query = query.filter(Job.experience_level.ilike(str(experience_level).strip()))

    jobs_found = query.limit(limit).all()
    results = []
    profile = current_user.profile

    for job in jobs_found:
        job_resp = _job_to_response(job, profile)
        referenced_jobs[job.id] = job_resp
        results.append(
            {
                "id": job.id,
                "title": job.title,
                "company": job.company,
                "location": job.location,
                "work_mode": job.work_mode,
                "experience_level": job.experience_level,
                "skills": job.skills,
                "match_score": job_resp.match_score,
                "matched_skills": job_resp.matched_skills,
                "missing_skills": job_resp.missing_skills,
                "reasons": job_resp.reasons,
            }
        )

    return results


def _execute_get_skill_gaps(
    args: Dict[str, Any],
    current_user: User,
    db: Session,
    referenced_jobs: Dict[int, JobResponse],
) -> Dict[str, Any]:
    job_id = args.get("job_id")
    if not job_id:
        return {"error": "Missing required job_id"}

    job = db.query(Job).filter(Job.id == int(job_id)).first()
    if not job:
        return {"error": f"Job posting with ID {job_id} not found"}

    profile = current_user.profile
    job_resp = _job_to_response(job, profile)
    referenced_jobs[job.id] = job_resp

    if not profile:
        return {
            "job_id": job.id,
            "title": job.title,
            "company": job.company,
            "required_skills": [s.strip() for s in (job.skills or "").split(",") if s.strip()],
            "message": "User has not configured their candidate profile skills yet.",
        }

    match_info = calculate_match(profile, job)
    user_skills = [s.name.lower() for s in (profile.skills or [])]

    return {
        "job_id": job.id,
        "title": job.title,
        "company": job.company,
        "match_score": match_info["match_score"],
        "matched_skills": match_info["matched_skills"],
        "missing_skills": match_info["missing_skills"],
        "reasons": match_info["reasons"],
        "candidate_skills": user_skills,
    }


def _generate_fallback(
    user_prompt: str,
    current_user: User,
    db: Session,
    referenced_jobs: Dict[int, JobResponse],
) -> ChatResponse:
    """Friendly fallback when Groq API is unavailable, unconfigured, or encounters an error."""
    # Attempt local smart matching based on user query
    terms = [w.strip() for w in user_prompt.lower().split() if len(w) > 3]
    query = db.query(Job)

    if terms:
        conditions = []
        for t in terms[:3]:
            term = f"%{t}%"
            conditions.extend([Job.title.ilike(term), Job.skills.ilike(term)])
        query = query.filter(or_(*conditions))

    fallback_jobs = query.limit(4).all()
    if not fallback_jobs:
        fallback_jobs = db.query(Job).limit(4).all()

    profile = current_user.profile
    job_responses = []
    for job in fallback_jobs:
        resp = _job_to_response(job, profile)
        referenced_jobs[job.id] = resp
        job_responses.append(resp)

    user_name = current_user.email.split("@")[0]
    fallback_message = (
        f"Hi {user_name}! I am currently running in offline fallback mode because the Groq AI service "
        "is temporarily unreachable or pending API key configuration.\n\n"
        "Here are relevant positions from our active listings that match your inquiry. "
        "You can click on any card below to view the complete details and match breakdown, or explore the Search page!"
    )

    return ChatResponse(
        reply=fallback_message,
        jobs=list(referenced_jobs.values()),
        tool_calls_count=0,
    )


@router.post("/chat", response_model=ChatResponse, summary="Interactive career assistant using Groq API with tool calling")
def chat_with_assistant(
    payload: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    POST /assistant/chat
    Connects to Groq API with system instructions, user context, and tool definitions.
    Strictly limited to 2 tools: search_jobs and get_skill_gaps.
    User ID and profile are securely extracted from the JWT token.
    Enforces a maximum of 3 tool calls per request.
    Provides a friendly fallback when Groq is unreachable.
    """
    settings = get_settings()
    referenced_jobs: Dict[int, JobResponse] = {}

    # Extract user message
    user_message = payload.message
    if not user_message and payload.messages:
        for m in reversed(payload.messages):
            if m.role == "user" and m.content:
                user_message = m.content
                break

    if not user_message:
        user_message = "What jobs do you recommend for me?"

    # Check for Groq API key
    groq_api_key = settings.GROQ_API_KEY
    if not groq_api_key or not groq_api_key.strip():
        logger.info("GROQ_API_KEY is not configured. Returning friendly smart fallback.")
        return _generate_fallback(user_message, current_user, db, referenced_jobs)

    # Build conversation messages
    system_prompt = _build_system_prompt(current_user)
    messages: List[Dict[str, Any]] = [{"role": "system", "content": system_prompt}]

    # Include recent history if provided
    if payload.messages:
        # Keep last 6 messages to stay within reasonable context window
        recent_history = payload.messages[-6:]
        for msg in recent_history:
            messages.append({"role": msg.role, "content": msg.content or ""})
    else:
        messages.append({"role": "user", "content": user_message})

    # Tool calling loop (maximum 3 tool calls total)
    MAX_TOOL_CALLS = 3
    tool_calls_count = 0
    groq_url = "https://api.groq.com/openai/v1/chat/completions"

    try:
        with httpx.Client(timeout=25.0) as client:
            while tool_calls_count < MAX_TOOL_CALLS:
                # Prepare payload
                req_data: Dict[str, Any] = {
                    "model": settings.GROQ_MODEL,
                    "messages": messages,
                    "temperature": 0.5,
                    "max_tokens": 1024,
                }

                # Only offer tools if under limit
                if tool_calls_count < MAX_TOOL_CALLS:
                    req_data["tools"] = GROQ_TOOLS
                    req_data["tool_choice"] = "auto"
                else:
                    req_data["tool_choice"] = "none"

                response = client.post(
                    groq_url,
                    headers={
                        "Authorization": f"Bearer {groq_api_key.strip()}",
                        "Content-Type": "application/json",
                    },
                    json=req_data,
                )

                if response.status_code != 200:
                    logger.error(
                        f"Groq API error HTTP {response.status_code}: {response.text}"
                    )
                    return _generate_fallback(user_message, current_user, db, referenced_jobs)

                resp_json = response.json()
                choice = resp_json["choices"][0]
                message_obj = choice["message"]
                tool_calls = message_obj.get("tool_calls")

                # If no tool calls requested, we have the final assistant response
                if not tool_calls:
                    final_content = message_obj.get("content") or "Here is what I found for you."
                    return ChatResponse(
                        reply=final_content,
                        jobs=list(referenced_jobs.values()),
                        tool_calls_count=tool_calls_count,
                    )

                # Process tool calls
                messages.append(message_obj)

                for tc in tool_calls:
                    if tool_calls_count >= MAX_TOOL_CALLS:
                        break

                    tool_name = tc["function"]["name"]
                    try:
                        tool_args = json.loads(tc["function"].get("arguments", "{}"))
                    except Exception:
                        tool_args = {}

                    # Strictly enforce only allowed tools
                    if tool_name == "search_jobs":
                        tool_result = _execute_search_jobs(
                            tool_args, current_user, db, referenced_jobs
                        )
                    elif tool_name == "get_skill_gaps":
                        # Note: User ID comes from JWT via current_user, NEVER from model args
                        tool_result = _execute_get_skill_gaps(
                            tool_args, current_user, db, referenced_jobs
                        )
                    else:
                        tool_result = {
                            "error": f"Tool '{tool_name}' is not supported. Only search_jobs and get_skill_gaps are permitted."
                        }

                    tool_calls_count += 1
                    messages.append(
                        {
                            "role": "tool",
                            "tool_call_id": tc["id"],
                            "name": tool_name,
                            "content": json.dumps(tool_result),
                        }
                    )

            # Reached max tool calls: request final response from model without tools
            final_req_data = {
                "model": settings.GROQ_MODEL,
                "messages": messages,
                "temperature": 0.5,
                "max_tokens": 1024,
            }
            final_resp = client.post(
                groq_url,
                headers={
                    "Authorization": f"Bearer {groq_api_key.strip()}",
                    "Content-Type": "application/json",
                },
                json=final_req_data,
            )

            if final_resp.status_code == 200:
                final_content = (
                    final_resp.json()["choices"][0]["message"].get("content")
                    or "Here is what I found for you based on the available data."
                )
            else:
                final_content = (
                    "Based on my analysis of the jobs and your profile, here are the most relevant opportunities."
                )

            return ChatResponse(
                reply=final_content,
                jobs=list(referenced_jobs.values()),
                tool_calls_count=tool_calls_count,
            )

    except Exception as e:
        logger.exception(f"Exception during Groq assistant chat execution: {e}")
        return _generate_fallback(user_message, current_user, db, referenced_jobs)
