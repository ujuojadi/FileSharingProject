from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from app.core.config import get_settings
from app.api import api_router

settings = get_settings()
app = FastAPI(title=settings.app_name, version="0.1.0")

# CORS configuration - must be added BEFORE other middleware
# For development, allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=False,  # Can't use True with "*" origins
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
    expose_headers=["*"],  # Expose all headers
)

UPLOAD_DIR = settings.uploads_dir

@app.on_event("startup")
def ensure_uploads_dir() -> None:
    os.makedirs(UPLOAD_DIR, exist_ok=True)


@app.get("/health", tags=["health"])  # simple health check
async def health() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(api_router)
