from __future__ import annotations

from pydantic import BaseModel, Field, conint
from uuid import UUID, uuid4
from datetime import datetime


class FeedbackBase(BaseModel):
    file_id: UUID
    user_id: UUID
    rating: conint(ge=1, le=5)  # 1..5
    comment: str | None = None


class FeedbackCreate(FeedbackBase):
    pass


class FeedbackUpdate(BaseModel):
    rating: conint(ge=1, le=5) | None = None
    comment: str | None = None


class Feedback(FeedbackBase):
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime | None = None
