from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict


# --- Token Schemas ---
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[int] = None
    email: Optional[str] = None


# --- Skill Schemas ---
class SkillBase(BaseModel):
    name: str


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int
    profile_id: int

    model_config = ConfigDict(from_attributes=True)


# --- Profile Schemas ---
class ProfileBase(BaseModel):
    experience_level: Optional[str] = None  # e.g., "Junior", "Mid", "Senior", "Lead"
    location: Optional[str] = None
    work_mode: Optional[str] = None  # e.g., "Remote", "Hybrid", "On-site"


class ProfileCreate(ProfileBase):
    skills: Optional[List[str]] = []


class ProfileUpdate(BaseModel):
    experience_level: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    skills: Optional[List[str]] = None


class ProfileResponse(ProfileBase):
    id: int
    user_id: int
    skills: List[SkillResponse] = []
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


# --- User Schemas ---
class UserBase(BaseModel):
    email: EmailStr


class UserRegister(UserBase):
    password: str
    experience_level: Optional[str] = None
    location: Optional[str] = None
    work_mode: Optional[str] = None
    skills: Optional[List[str]] = []


class UserLogin(UserBase):
    password: str


class UserResponse(UserBase):
    id: int
    created_at: Optional[datetime] = None
    profile: Optional[ProfileResponse] = None

    model_config = ConfigDict(from_attributes=True)


# --- Auth Response with Token and User ---
class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# --- Job Schemas ---
class JobBase(BaseModel):
    title: str
    company: str
    description: Optional[str] = None
    location: str
    work_mode: str
    experience_level: str
    skills: Optional[str] = None  # Comma-separated skills
    apply_url: Optional[str] = None


class JobCreate(JobBase):
    pass


class JobResponse(JobBase):
    id: int
    created_at: Optional[datetime] = None

    # Match attributes (computed dynamically when candidate profile is available)
    match_score: Optional[float] = None
    matched_skills: Optional[List[str]] = None
    missing_skills: Optional[List[str]] = None
    reasons: Optional[List[str]] = None

    model_config = ConfigDict(from_attributes=True)


class PaginatedJobsResponse(BaseModel):
    items: List[JobResponse]
    jobs: Optional[List[JobResponse]] = None
    total: int
    page: int
    limit: int
    total_pages: int

    model_config = ConfigDict(from_attributes=True)


# --- SavedJob Schemas ---
class SavedJobStatusUpdate(BaseModel):
    status: str


class SavedJobResponse(BaseModel):
    id: int
    user_id: int
    job_id: int
    status: str = "Saved"
    created_at: Optional[datetime] = None
    job: Optional[JobResponse] = None

    model_config = ConfigDict(from_attributes=True)


class UnsaveResponse(BaseModel):
    message: str
    job_id: int
    saved: bool = False
