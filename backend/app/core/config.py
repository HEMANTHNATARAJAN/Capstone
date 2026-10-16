from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    PROJECT_NAME: str = "Book Worm E-Bookstore API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Environment & Host
    ENVIRONMENT: str = "development"
    HOST: str = "127.0.0.1"
    PORT: int = 8000
    
    # Database
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL",
        "sqlite+aiosqlite:///./bookworm.db"
    )
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-key-bookworm-super-secure-token-2025")
    SESSION_COOKIE_NAME: str = "bookworm_session"
    SESSION_EXPIRE_HOURS: int = 24
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ]
    
    # Store Policies
    ORDER_CANCELLATION_HOURS: int = 48
    DEFAULT_TAX_RATE: float = 0.12  # 12%
    DEFAULT_DELIVERY_DAYS: int = 4

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()
