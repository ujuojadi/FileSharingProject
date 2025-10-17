from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class GroupCreate(BaseModel):
    name: str
    description: str | None = None


class Group(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    name: str
    description: str | None = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


class GroupMembership(BaseModel):
    id: UUID = Field(default_factory=uuid4)
    group_id: UUID
    user_id: UUID
    joined_at: datetime = Field(default_factory=datetime.utcnow)
