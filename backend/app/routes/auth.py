from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import User, Profile, Skill
from app.schemas import UserRegister, UserLogin, UserResponse, AuthResponse
from app.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    decode_access_token,
)
import jwt

router = APIRouter(tags=["Authentication"])
security_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(security_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that authenticates the user via JWT Bearer token."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not credentials or not credentials.credentials:
        raise credentials_exception

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
        user_id_str: str | None = payload.get("sub")
        if user_id_str is None:
            raise credentials_exception
        user_id = int(user_id_str)
    except (jwt.PyJWTError, ValueError):
        raise credentials_exception

    user = (
        db.query(User)
        .options(joinedload(User.profile).joinedload(Profile.skills))
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise credentials_exception

    return user


@router.post(
    "/auth/register",
    response_model=AuthResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """
    Registers a new user with hashed password, creates their initial profile
    and associated skills, and returns an access token with user details.
    """
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    # Hash the password with bcrypt
    hashed_pwd = get_password_hash(payload.password)

    # Create User
    new_user = User(
        email=payload.email,
        hashed_password=hashed_pwd,
    )
    db.add(new_user)
    db.flush()  # Populate new_user.id

    # Create associated Profile
    profile = Profile(
        user_id=new_user.id,
        experience_level=payload.experience_level,
        location=payload.location,
        work_mode=payload.work_mode,
    )
    db.add(profile)
    db.flush()

    # Add associated Skills if provided
    if payload.skills:
        for skill_name in payload.skills:
            clean_name = skill_name.strip()
            if clean_name:
                db.add(Skill(profile_id=profile.id, name=clean_name))

    db.commit()

    # Re-query user with relations eager-loaded
    fresh_user = (
        db.query(User)
        .options(joinedload(User.profile).joinedload(Profile.skills))
        .filter(User.id == new_user.id)
        .first()
    )

    access_token = create_access_token(
        data={"sub": str(fresh_user.id), "email": fresh_user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": fresh_user,
    }


@router.post(
    "/auth/login",
    response_model=AuthResponse,
    summary="User login with JWT generation",
)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """
    Authenticates user credentials and returns a signed JWT access token.
    """
    user = (
        db.query(User)
        .options(joinedload(User.profile).joinedload(Profile.skills))
        .filter(User.email == payload.email)
        .first()
    )

    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    access_token = create_access_token(
        data={"sub": str(user.id), "email": user.email}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user,
    }


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current authenticated user profile & skills",
)
@router.get(
    "/auth/me",
    response_model=UserResponse,
    include_in_schema=False,
)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Returns the currently authenticated user's details, profile, and skills.
    Requires Bearer token authorization header.
    """
    return current_user
