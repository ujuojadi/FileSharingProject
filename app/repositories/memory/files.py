from __future__ import annotations

from typing import Optional
from uuid import UUID

from app.schemas.files import FileMeta, FileMetaCreate


class InMemoryFilesRepository:
    def __init__(self) -> None:
        self._files_by_id: dict[UUID, FileMeta] = {}
        self._files_by_uploader: dict[UUID, list[UUID]] = {}

    async def create(self, data: FileMetaCreate, file_id: Optional[UUID] = None) -> FileMeta:
        data_dict = data.model_dump()
        if file_id:
            # Create FileMeta with specific ID by manually constructing it
            meta = FileMeta(
                id=file_id,
                filename=data_dict["filename"],
                content_type=data_dict["content_type"],
                size_bytes=data_dict["size_bytes"],
                uploader_id=data_dict["uploader_id"],
                course_code=data_dict.get("course_code"),
                course_name=data_dict.get("course_name"),
                description=data_dict.get("description"),
                stored_path=data_dict["stored_path"],
            )
        else:
            meta = FileMeta(**data_dict)
        self._files_by_id[meta.id] = meta
        self._files_by_uploader.setdefault(meta.uploader_id, []).append(meta.id)
        return meta

    async def get(self, file_id: UUID) -> Optional[FileMeta]:
        return self._files_by_id.get(file_id)

    async def list(self) -> list[FileMeta]:
        return list(self._files_by_id.values())

    async def list_by_uploader(self, user_id: UUID) -> list[FileMeta]:
        ids = self._files_by_uploader.get(user_id, [])
        return [self._files_by_id[i] for i in ids]
