from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # =========================
    # JWT
    # =========================
    SECRET_KEY: str = "super-secret-key-change-me"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # =========================
    # DATABASE
    # =========================
    DATABASE_URL: str

    # =========================
    # AI
    # =========================
    OPENAI_API_KEY: Optional[str] = None

    class Config:
        env_file = ".env"
        extra = "forbid"


settings = Settings()
