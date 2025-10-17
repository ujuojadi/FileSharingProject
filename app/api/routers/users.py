from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from app.services.auth import get_current_user
from app.repositories.interfaces import UsersRepository
from app.services.deps import get_users_repo
from app.schemas.user import User, UserPublic

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/me", response_model=UserPublic)
async def read_me(current_user: User = Depends(get_current_user)) -> UserPublic:
    return UserPublic.model_validate(current_user)


@router.get("/", response_model=list[UserPublic])
async def list_users(users_repo: UsersRepository = Depends(get_users_repo)) -> list[UserPublic]:
    users = await users_repo.list()
    return [UserPublic.model_validate(u) for u in users]


@router.get("/{user_id}", response_model=UserPublic)
async def get_user(user_id: UUID, users_repo: UsersRepository = Depends(get_users_repo)) -> UserPublic:
    user = await users_repo.get(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic.model_validate(user)
