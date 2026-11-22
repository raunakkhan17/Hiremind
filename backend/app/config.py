from functools import lru_cache
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "HireMind API"
    APP_ENV: str = "development"
    DEBUG: bool = True
    PORT: int = 8000
    HOST: str = "0.0.0.0"
    DATABASE_URL: str = "sqlite:///./hiremind.db"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173"

    # JWT Authentication
    SECRET_KEY: str = "hiremind-super-secret-key-change-in-production-min-32-chars"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440  # 24 hours

    # Groq AI Assistant
    GROQ_API_KEY: Optional[str] = None
    GROQ_MODEL: str = "llama-3.3-70b-versatile"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]
        # Always guarantee localhost:5173 and 127.0.0.1:5173 are permitted
        for default_origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
            if default_origin not in origins:
                origins.append(default_origin)
        return origins


@lru_cache()
def get_settings() -> Settings:
    return Settings()
