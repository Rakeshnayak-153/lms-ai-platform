import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    APP_NAME: str = "LMS-AI Tutor Service"
    PORT: int = int(os.getenv("PORT", 8000))
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/lms_ai_db")
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    DEFAULT_EXPLANATION_MODE: str = "intermediate"

    class Config:
        env_file = ".env"

settings = Settings()
