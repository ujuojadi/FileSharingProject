from __future__ import annotations

from pydantic import BaseModel, Field
from uuid import UUID, uuid4
from datetime import datetime


class FileMetaBase(BaseModel):
    filename: str
    content_type: str
    size_bytes: int
    uploader_id: UUID
    course_code: str | None = None
    course_name: str | None = None
    description: str | None = None


class FileMetaCreate(FileMetaBase):
    stored_path: str


class FileMeta(FileMetaBase):
    id: UUID = Field(default_factory=uuid4)
    stored_path: str
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
