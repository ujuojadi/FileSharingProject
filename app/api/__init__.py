from fastapi import APIRouter

from .routers import auth, users, files, search, feedback, groups

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(files.router)
api_router.include_router(search.router)
api_router.include_router(feedback.router)
api_router.include_router(groups.router)

__all__ = ["api_router"]
