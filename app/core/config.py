from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl
import os


class Settings(BaseSettings):
    # Allow other env vars in the project-level .env (ignore extras)
    model_config = SettingsConfigDict(env_file=".env", env_prefix="NOTESHARE_", case_sensitive=False, extra="ignore")

    app_name: str = "NOTESHARE API"
    environment: str = "development"

    # Security
    jwt_secret_key: str = "CHANGE_ME_SUPER_SECRET"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # Domain policy
    allowed_email_domain: str = "ul.edu"

    # CORS
    cors_allow_origins: list[str] = ["*"]

    # File uploads
    base_dir: str = os.path.dirname(os.path.dirname(__file__))
    uploads_dir: str = os.path.join(base_dir, "uploads")
    
    # P2P Backend
    p2p_backend_url: str = "http://localhost:8081"
    
    # Database (async SQLAlchemy URL).
    # By default the project will attempt to use a local MySQL/MariaDB instance
    # for development. You can override this with NOTESHARE_DATABASE_URL or
    # provide legacy DB_* variables. If you prefer SQLite, set
    # NOTESHARE_DATABASE_URL=sqlite+aiosqlite:///./dev.db
    database_url: str = "mysql+aiomysql://fileshare_user:your_db_password_here@127.0.0.1:3306/fileshare_db?charset=utf8mb4"


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    # Backwards-compat / convenience: allow legacy DB_* env vars or a
    # NOTESHARE_DATABASE_URL / DATABASE_URL to override the default.
    # Priority (highest to lowest): NOTESHARE_DATABASE_URL, DATABASE_URL, legacy DB_* vars
    env_db_url = os.getenv("NOTESHARE_DATABASE_URL") or os.getenv("DATABASE_URL") or os.getenv("DB_URL")
    if env_db_url:
        settings.database_url = env_db_url
    else:
        # If user provided legacy DB_* variables (common in older docs), construct a MySQL URL
        db_host = os.getenv("DB_HOST")
        if db_host:
            db_user = os.getenv("DB_USER", "root")
            db_password = os.getenv("DB_PASSWORD", "")
            db_port = os.getenv("DB_PORT", "3306")
            db_name = os.getenv("DB_NAME", "fileshare_db")
            # Use aiomysql async driver for SQLAlchemy
            settings.database_url = f"mysql+aiomysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"

    # Also support legacy SECRET_KEY env var for convenience
    settings.jwt_secret_key = os.getenv("NOTESHARE_JWT_SECRET_KEY") or os.getenv("SECRET_KEY") or settings.jwt_secret_key

    os.makedirs(settings.uploads_dir, exist_ok=True)
    return settings
