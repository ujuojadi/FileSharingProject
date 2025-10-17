from __future__ import annotations

from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import AnyUrl
import os


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="NOTESHARE_", case_sensitive=False)

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


@lru_cache
def get_settings() -> Settings:
    settings = Settings()
    os.makedirs(settings.uploads_dir, exist_ok=True)
    return settings
