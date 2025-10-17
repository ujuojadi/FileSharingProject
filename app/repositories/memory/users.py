from __future__ import annotations

from typing import Optional
from uuid import UUID, uuid4

from app.schemas.user import User, UserCreate
from app.core.security import hash_password


class InMemoryUsersRepository:
    def __init__(self) -> None:
        self._users_by_id: dict[UUID, User] = {}
        self._users_by_email: dict[str, UUID] = {}

    async def create(self, data: UserCreate) -> User:
        password_hash = hash_password(data.password)
        user = User(email=data.email, full_name=data.full_name, password_hash=password_hash)
        self._users_by_id[user.id] = user
        self._users_by_email[user.email.lower()] = user.id
        return user

    async def get_by_email(self, email: str) -> Optional[User]:
        user_id = self._users_by_email.get(email.lower())
        return self._users_by_id.get(user_id) if user_id else None

    async def get(self, user_id: UUID) -> Optional[User]:
        return self._users_by_id.get(user_id)

    async def list(self) -> list[User]:
        return list(self._users_by_id.values())

    async def verify(self, user_id: UUID) -> None:
        user = self._users_by_id.get(user_id)
        if user:
            user.is_verified = True
