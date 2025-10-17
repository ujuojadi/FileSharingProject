from __future__ import annotations

from typing import Optional
from uuid import UUID

from app.schemas.feedback import Feedback, FeedbackCreate, FeedbackUpdate


class InMemoryFeedbackRepository:
    def __init__(self) -> None:
        self._feedback_by_id: dict[UUID, Feedback] = {}
        self._feedback_by_file: dict[UUID, list[UUID]] = {}

    async def create(self, data: FeedbackCreate) -> Feedback:
        fb = Feedback(**data.model_dump())
        self._feedback_by_id[fb.id] = fb
        self._feedback_by_file.setdefault(fb.file_id, []).append(fb.id)
        return fb

    async def update(self, feedback_id: UUID, data: FeedbackUpdate) -> Optional[Feedback]:
        fb = self._feedback_by_id.get(feedback_id)
        if not fb:
            return None
        if data.rating is not None:
            fb.rating = data.rating
        if data.comment is not None:
            fb.comment = data.comment
        from datetime import datetime

        fb.updated_at = datetime.utcnow()
        return fb

    async def list_for_file(self, file_id: UUID) -> list[Feedback]:
        ids = self._feedback_by_file.get(file_id, [])
        return [self._feedback_by_id[i] for i in ids]

    async def average_for_file(self, file_id: UUID) -> Optional[float]:
        items = await self.list_for_file(file_id)
        if not items:
            return None
        total = sum(f.rating for f in items)
        return total / len(items)
