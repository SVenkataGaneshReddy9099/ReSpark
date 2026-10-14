"""ReSpark Application Configuration."""
import os
import urllib.parse
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Base directory: backend/
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load environment variables from .env file
load_dotenv(BASE_DIR / ".env")
load_dotenv()


def normalize_database_url(url: str) -> str:
    """Normalizes database URLs for SQLAlchemy compatibility across PostgreSQL and SQLite.
    
    1. Converts legacy 'postgres://' scheme to 'postgresql://'.
    2. Gracefully percent-encodes unescaped '@' symbols in user passwords.
    """
    if not url:
        return url

    # Fix legacy postgres:// prefix
    if url.startswith("postgres://"):
        url = "postgresql://" + url[len("postgres://"):]

    # Handle unencoded special characters in password for PostgreSQL URLs
    if "://" in url:
        scheme, rest = url.split("://", 1)
        if (scheme.startswith("postgresql") or scheme.startswith("postgres")) and rest.count("@") > 1:
            # The host starts after the last '@'
            last_at_idx = rest.rfind("@")
            userinfo = rest[:last_at_idx]
            host_and_path = rest[last_at_idx + 1:]
            if ":" in userinfo:
                username, password = userinfo.split(":", 1)
                # Safely percent-encode password (e.g. '@' -> '%40')
                encoded_password = urllib.parse.quote(password, safe="")
                url = f"{scheme}://{username}:{encoded_password}@{host_and_path}"

    return url


class Settings:
    PROJECT_NAME: str = "ReSpark"
    PROJECT_TAGLINE: str = "Rediscover the Value Around You."
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Database URL from environment, normalized for SQLAlchemy & PostgreSQL
    _raw_db_url = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'respark.db'}")
    DATABASE_URL: str = normalize_database_url(_raw_db_url)
    
    # CORS Origins (includes Vercel domains, local dev, and wildcard)
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]
    
    # Demo configuration
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "True").lower() in ("true", "1", "t")


settings = Settings()
