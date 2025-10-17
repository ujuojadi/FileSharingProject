from __future__ import annotations

import os
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.responses import FileResponse

from app.core.config import get_settings
from app.schemas.files import FileMeta, FileMetaCreate
from app.repositories.interfaces import FilesRepository
from app.services.deps import get_files_repo
from app.services.auth import get_current_verified_user
from app.schemas.user import User

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/", response_model=list[FileMeta])
async def list_files(files_repo: FilesRepository = Depends(get_files_repo)) -> list[FileMeta]:
    return await files_repo.list()


@router.get("/{file_id}", response_model=FileMeta)
async def get_file_meta(file_id: UUID, files_repo: FilesRepository = Depends(get_files_repo)) -> FileMeta:
    meta = await files_repo.get(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    return meta


@router.post("/upload", response_model=FileMeta)
async def upload_file(
    course_code: str | None = None,
    course_name: str | None = None,
    description: str | None = None,
    file: UploadFile = File(...),
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
) -> FileMeta:
    settings = get_settings()
    upload_dir = settings.uploads_dir
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Filename required")
    stored_path = os.path.join(upload_dir, filename)

    # Ensure unique filename by appending a counter if necessary
    base, ext = os.path.splitext(filename)
    counter = 1
    while os.path.exists(stored_path):
        stored_path = os.path.join(upload_dir, f"{base}_{counter}{ext}")
        counter += 1

    size = 0
    with open(stored_path, "wb") as out:
        while True:
            chunk = await file.read(1024 * 1024)
            if not chunk:
                break
            out.write(chunk)
            size += len(chunk)

    meta = FileMetaCreate(
        filename=os.path.basename(stored_path),
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        uploader_id=current_user.id,
        course_code=course_code,
        course_name=course_name,
        description=description,
        stored_path=stored_path,
    )
    created = await files_repo.create(meta)
    return created


@router.get("/{file_id}/download")
async def download_file(file_id: UUID, files_repo: FilesRepository = Depends(get_files_repo)):
    meta = await files_repo.get(file_id)
    if not meta or not os.path.exists(meta.stored_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(path=meta.stored_path, media_type=meta.content_type, filename=meta.filename)
