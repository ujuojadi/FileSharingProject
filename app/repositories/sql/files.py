from __future__ import annotations

from typing import Optional
from uuid import UUID, uuid4
from datetime import datetime
from sqlalchemy import select, insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.interfaces import FilesRepository
from app.schemas.files import FileMeta, FileMetaCreate
from app.models import File as DBFile
from app.db import SessionLocal


class SQLFilesRepository:
    def __init__(self, session: AsyncSession | None = None) -> None:
        self._session = session

    async def create(self, data: FileMetaCreate, file_id: Optional[UUID] = None) -> FileMeta:
        # Accept raw bytes in data.data or rely on stored_path
        db_file = DBFile(
            filename=data.filename,
            content_type=data.content_type,
            size_bytes=data.size_bytes,
            uploader_id=str(data.uploader_id),
            course_code=data.course_code,
            course_name=data.course_name,
            description=data.description,
            stored_path=data.stored_path,
        )
        if file_id:
            db_file.id = str(file_id)
        if data.data is not None:
            db_file.data = data.data

        async with SessionLocal() as session:
            session.add(db_file)
            await session.commit()
            await session.refresh(db_file)

        return FileMeta(
            id=UUID(db_file.id),
            filename=db_file.filename,
            content_type=db_file.content_type,
            size_bytes=db_file.size_bytes,
            uploader_id=UUID(db_file.uploader_id) if db_file.uploader_id else None,
            course_code=db_file.course_code,
            course_name=db_file.course_name,
            description=db_file.description,
            stored_path=db_file.stored_path,
            uploaded_at=db_file.uploaded_at,
        )

    async def get(self, file_id: UUID) -> Optional[FileMeta]:
        q = select(DBFile).where(DBFile.id == str(file_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_file = result.scalar_one_or_none()
        if not db_file:
            return None
        return FileMeta(
            id=UUID(db_file.id),
            filename=db_file.filename,
            content_type=db_file.content_type,
            size_bytes=db_file.size_bytes,
            uploader_id=UUID(db_file.uploader_id) if db_file.uploader_id else None,
            course_code=db_file.course_code,
            course_name=db_file.course_name,
            description=db_file.description,
            stored_path=db_file.stored_path,
            uploaded_at=db_file.uploaded_at,
        )

    async def list(self) -> list[FileMeta]:
        q = select(DBFile)
        async with SessionLocal() as session:
            result = await session.execute(q)
            rows = result.scalars().all()
        out: list[FileMeta] = []
        for db_file in rows:
            out.append(
                FileMeta(
                    id=UUID(db_file.id),
                    filename=db_file.filename,
                    content_type=db_file.content_type,
                    size_bytes=db_file.size_bytes,
                    uploader_id=UUID(db_file.uploader_id) if db_file.uploader_id else None,
                    course_code=db_file.course_code,
                    course_name=db_file.course_name,
                    description=db_file.description,
                    stored_path=db_file.stored_path,
                    uploaded_at=db_file.uploaded_at,
                )
            )
        return out

    async def list_by_uploader(self, user_id: UUID) -> list[FileMeta]:
        q = select(DBFile).where(DBFile.uploader_id == str(user_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            rows = result.scalars().all()
        out: list[FileMeta] = []
        for db_file in rows:
            out.append(
                FileMeta(
                    id=UUID(db_file.id),
                    filename=db_file.filename,
                    content_type=db_file.content_type,
                    size_bytes=db_file.size_bytes,
                    uploader_id=UUID(db_file.uploader_id) if db_file.uploader_id else None,
                    course_code=db_file.course_code,
                    course_name=db_file.course_name,
                    description=db_file.description,
                    stored_path=db_file.stored_path,
                    uploaded_at=db_file.uploaded_at,
                )
            )
        return out

    async def get_data(self, file_id: UUID) -> Optional[bytes]:
        q = select(DBFile).where(DBFile.id == str(file_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_file = result.scalar_one_or_none()
        if not db_file:
            return None
        return db_file.data
    
    async def delete(self, file_id: UUID) -> bool:
        q = select(DBFile).where(DBFile.id == str(file_id))
        async with SessionLocal() as session:
            result = await session.execute(q)
            db_file = result.scalar_one_or_none()
            if not db_file:
                return False
            await session.delete(db_file)
            await session.commit()
        return True
