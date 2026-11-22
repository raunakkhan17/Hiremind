import pytest
from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.database import Base, get_db
from app.main import app
from app.models import User, Profile, Skill, Job
from app.security import create_access_token


# Set up isolated in-memory test database
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)


@pytest.fixture(autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()

    # Seed test user with profile
    user = User(id=1, email="candidate@hiremind.io", hashed_password="hashed_pw")
    db.add(user)
    db.commit()

    profile = Profile(
        id=1,
        user_id=1,
        experience_level="Senior",
        location="Remote",
        work_mode="Remote",
    )
    db.add(profile)
    db.commit()

    s1 = Skill(profile_id=1, name="Python")
    s2 = Skill(profile_id=1, name="FastAPI")
    s3 = Skill(profile_id=1, name="React")
    db.add_all([s1, s2, s3])

    # Seed test jobs
    j1 = Job(
        id=1,
        title="Senior Python Backend Architect",
        company="HireScale Systems",
        description="Build distributed APIs with Python and FastAPI",
        location="Remote",
        work_mode="Remote",
        experience_level="Senior",
        skills="Python, FastAPI, Docker, PostgreSQL",
        apply_url="https://example.com/apply/1",
    )
    j2 = Job(
        id=2,
        title="Frontend React Engineer",
        company="WebCraft Studio",
        description="Craft modern user interfaces using React and TypeScript",
        location="San Francisco",
        work_mode="Hybrid",
        experience_level="Mid",
        skills="React, TypeScript, Tailwind",
        apply_url="https://example.com/apply/2",
    )
    db.add_all([j1, j2])
    db.commit()
    db.close()

    yield

    Base.metadata.drop_all(bind=engine)


def test_assistant_chat_unauthenticated():
    """Unauthenticated access should be rejected with 401."""
    response = client.post("/assistant/chat", json={"message": "Recommend some jobs"})
    assert response.status_code == 401


def test_assistant_chat_fallback_when_no_groq_key():
    """When GROQ_API_KEY is not configured or blank, returns a friendly fallback with relevant jobs."""
    token = create_access_token(data={"sub": 1, "email": "candidate@hiremind.io"})
    headers = {"Authorization": f"Bearer {token}"}

    with patch("app.routes.assistant.get_settings") as mock_settings:
        mock_obj = MagicMock()
        mock_obj.GROQ_API_KEY = None
        mock_obj.GROQ_MODEL = "llama-3.3-70b-versatile"
        mock_settings.return_value = mock_obj

        response = client.post(
            "/assistant/chat",
            json={"message": "Looking for Python roles"},
            headers=headers,
        )

        assert response.status_code == 200
        data = response.json()
        assert "reply" in data
        assert "fallback" in data["reply"].lower() or "Groq" in data["reply"]
        assert len(data["jobs"]) > 0
        assert data["tool_calls_count"] == 0


def test_assistant_chat_groq_with_tool_calling():
    """Tests successful Groq tool calling for search_jobs."""
    token = create_access_token(data={"sub": 1, "email": "candidate@hiremind.io"})
    headers = {"Authorization": f"Bearer {token}"}

    # Simulate Groq tool call response followed by final assistant response
    mock_tool_call_response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [
                        {
                            "id": "call_123",
                            "type": "function",
                            "function": {
                                "name": "search_jobs",
                                "arguments": '{"query": "Python", "limit": 2}',
                            },
                        }
                    ],
                }
            }
        ]
    }

    mock_final_response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "I found a great match: Senior Python Backend Architect at HireScale Systems with high compatibility!",
                }
            }
        ]
    }

    with patch("app.routes.assistant.get_settings") as mock_settings:
        mock_obj = MagicMock()
        mock_obj.GROQ_API_KEY = "gsk_mock_test_key"
        mock_obj.GROQ_MODEL = "llama-3.3-70b-versatile"
        mock_settings.return_value = mock_obj

        with patch("httpx.Client.post") as mock_post:
            resp1 = MagicMock()
            resp1.status_code = 200
            resp1.json.return_value = mock_tool_call_response

            resp2 = MagicMock()
            resp2.status_code = 200
            resp2.json.return_value = mock_final_response

            mock_post.side_effect = [resp1, resp2]

            response = client.post(
                "/assistant/chat",
                json={"message": "Can you find Python positions for me?"},
                headers=headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "Senior Python Backend Architect" in data["reply"]
            assert data["tool_calls_count"] == 1
            assert len(data["jobs"]) == 1
            assert data["jobs"][0]["title"] == "Senior Python Backend Architect"


def test_assistant_chat_skill_gaps_tool_uses_jwt_not_model():
    """Verifies get_skill_gaps tool uses the current user from JWT token and returns gaps."""
    token = create_access_token(data={"sub": 1, "email": "candidate@hiremind.io"})
    headers = {"Authorization": f"Bearer {token}"}

    mock_tool_call_response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": None,
                    "tool_calls": [
                        {
                            "id": "call_gap_1",
                            "type": "function",
                            "function": {
                                "name": "get_skill_gaps",
                                "arguments": '{"job_id": 1}',
                            },
                        }
                    ],
                }
            }
        ]
    }

    mock_final_response = {
        "choices": [
            {
                "message": {
                    "role": "assistant",
                    "content": "You match on Python and FastAPI! To bridge the remaining gap, consider Docker and PostgreSQL.",
                }
            }
        ]
    }

    with patch("app.routes.assistant.get_settings") as mock_settings:
        mock_obj = MagicMock()
        mock_obj.GROQ_API_KEY = "gsk_mock_test_key"
        mock_obj.GROQ_MODEL = "llama-3.3-70b-versatile"
        mock_settings.return_value = mock_obj

        with patch("httpx.Client.post") as mock_post:
            resp1 = MagicMock()
            resp1.status_code = 200
            resp1.json.return_value = mock_tool_call_response

            resp2 = MagicMock()
            resp2.status_code = 200
            resp2.json.return_value = mock_final_response

            mock_post.side_effect = [resp1, resp2]

            response = client.post(
                "/assistant/chat",
                json={"message": "What skills am I missing for job 1?"},
                headers=headers,
            )

            assert response.status_code == 200
            data = response.json()
            assert "Docker and PostgreSQL" in data["reply"]
            assert data["tool_calls_count"] == 1
            assert len(data["jobs"]) == 1
            assert data["jobs"][0]["id"] == 1
