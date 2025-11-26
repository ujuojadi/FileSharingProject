from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core.config import get_settings
from app.api import api_router
from app.db import engine
from app.models import Base as AppBase
import asyncio
import os

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

# Simple CORS; adjust origins as needed
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = settings.uploads_dir

@app.on_event("startup")
def ensure_uploads_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.on_event("startup")
async def create_tables_if_missing() -> None:
    """Optionally create missing tables on first startup.

    Set the environment variable `NOTESHARE_AUTO_INIT=true` on the service to enable.
    This will run a non-destructive `create_all()` (it will NOT drop tables).
    Useful when you cannot run `init_db.py` via shell (e.g., Render free tier).
    """
    try:
        if os.getenv("NOTESHARE_AUTO_INIT", "").lower() in ("1", "true", "yes"):
            # Create any missing tables (non-destructive)
            async with engine.begin() as conn:
                await conn.run_sync(AppBase.metadata.create_all)
    except Exception:
        # Don't block startup on create failures; log to stdout for Render logs
        import traceback
        traceback.print_exc()


@app.get("/health", tags=["health"])  # simple health check
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router)
