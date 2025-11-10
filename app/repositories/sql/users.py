from __future__ import annotations

from typing import Optional
from uuid import UUID, UUID as _UUID
import uuid
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.interfaces import UsersRepository
from app.schemas.user import User as UserSchema, UserCreate
from app.models import User as DBUser
from app.db import SessionLocal
from app.core.security import hash_password


class SQLUsersRepository:
    def __init__(self, session: AsyncSession | None = None) -> None:
        self._session = session

    # The repository creates short-lived sessions when one isn't provided.

    async def create(self, data: UserCreate) -> UserSchema:
        pwd_hash = hash_password(data.password)
        # create DBUser; DB model assigns a UUID string by default
        db_user = DBUser(email=data.email, full_name=data.full_name, password_hash=pwd_hash)
        # NOTE: SQLAlchemy will generate id via default factory; ensure id is str(uuid)
        async with SessionLocal() as session:
            session.add(db_user)
            await session.commit()
            await session.refresh(db_user)
        # convert id string to UUID object for schema compatibility
        try:
            uid = _UUID(db_user.id)
        except Exception:
            uid = uuid.UUID(db_user.id)
        return UserSchema(
            id=uid,
            email=db_user.email,
            full_name=db_user.full_name,
            is_verified=db_user.is_verified,
            password_hash=db_user.password_hash,
            created_at=db_user.created_at,
        )

    async def get_by_email(self, email: str) -> Optional[UserSchema]:
        q = select(DBUser).where(DBUser.email == email)
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_user = result.scalar_one_or_none()
        if not db_user:
            return None
        try:
            uid = _UUID(db_user.id)
        except Exception:
            uid = uuid.UUID(db_user.id)
        return UserSchema(
            id=uid,
            email=db_user.email,
            full_name=db_user.full_name,
            is_verified=db_user.is_verified,
            password_hash=db_user.password_hash,
            created_at=db_user.created_at,
        )

    async def get(self, user_id: UUID) -> Optional[UserSchema]:
        q = select(DBUser).where(DBUser.id == str(user_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_user = result.scalar_one_or_none()
        if not db_user:
            return None
        try:
            uid = _UUID(db_user.id)
        except Exception:
            uid = uuid.UUID(db_user.id)
        return UserSchema(
            id=uid,
            email=db_user.email,
            full_name=db_user.full_name,
            is_verified=db_user.is_verified,
            password_hash=db_user.password_hash,
            created_at=db_user.created_at,
        )

    async def list(self) -> list[UserSchema]:
        q = select(DBUser)
        async with SessionLocal() as session:
            result = await session.execute(q)
            users = result.scalars().all()
        return [
            UserSchema(
                id=( _UUID(u.id) if isinstance(u.id, str) else u.id ),
                email=u.email,
                full_name=u.full_name,
                is_verified=u.is_verified,
                password_hash=u.password_hash,
                created_at=u.created_at,
            )
            for u in users
        ]

    async def verify(self, user_id: UUID) -> None:
        q = select(DBUser).where(DBUser.id == str(user_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_user = result.scalar_one_or_none()
            if db_user:
                db_user.is_verified = True
                session.add(db_user)
                await session.commit()
