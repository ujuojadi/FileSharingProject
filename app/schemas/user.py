from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, constr
from uuid import UUID, uuid4
from datetime import datetime


class UserBase(BaseModel):
    email: EmailStr
    full_name: str = Field(min_length=2, max_length=100)


class UserCreate(UserBase):
    # bcrypt has a 72-byte input limitation; enforce a max length to avoid hashing errors.
    password: constr(min_length=8, max_length=72)


class User(UserBase):
    id: UUID = Field(default_factory=uuid4)
    is_verified: bool = False
    password_hash: str
    created_at: datetime = Field(default_factory=datetime.utcnow)


class UserPublic(UserBase):
    id: UUID
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
