from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import computed_field
GO_BACKEND_URL = "http://localhost:8080"  # adjust port if needed


class Settings(BaseSettings):
    SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    DB_HOST: str = "127.0.0.1"
    DB_PORT: int = 3306
    DB_NAME: str
    DB_USER: str
    DB_PASSWORD: str

    # Optional: CORS origins (comma-separated)
    CORS_ORIGINS: str = "*"

    model_config = SettingsConfigDict(env_file="fsp.env", env_file_encoding="utf-8")

    @computed_field(return_type=str)
    def DATABASE_URL(self) -> str:
        # async SQLAlchemy URL for MariaDB
        return (
            f"mysql+aiomysql://{self.DB_USER}:{self.DB_PASSWORD}@"
            f"{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}?charset=utf8mb4"
        )

settings = Settings()
