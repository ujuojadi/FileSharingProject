from __future__ import annotations

import os
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form
from fastapi.responses import StreamingResponse
import io

from app.core.config import get_settings
from app.schemas.files import FileMeta, FileMetaCreate
from app.repositories.interfaces import FilesRepository
from app.services.deps import get_files_repo
from app.services.auth import get_current_verified_user
from app.services.p2p_client import get_p2p_client
from app.schemas.user import User

router = APIRouter(prefix="/files", tags=["files"])


@router.get("/", response_model=list[FileMeta])
async def list_files(
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
) -> list[FileMeta]:
    return await files_repo.list()


@router.get("/me", response_model=list[FileMeta])
async def list_my_files(
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
) -> list[FileMeta]:
    return await files_repo.list_by_uploader(current_user.id)


@router.get("/{file_id}", response_model=FileMeta)
async def get_file_meta(
    file_id: UUID,
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
) -> FileMeta:
    meta = await files_repo.get(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    return meta


@router.post("/upload", response_model=FileMeta)
async def upload_file(
    file: UploadFile = File(...),
    course_code: str | None = Form(None),
    course_name: str | None = Form(None),
    description: str | None = Form(None),
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
) -> FileMeta:
    filename = file.filename
    if not filename:
        raise HTTPException(status_code=400, detail="Filename required")
    
    # Read file content
    file_content = await file.read()
    size = len(file_content)
    
    # Generate a unique file ID that will be used as P2P key
    from uuid import uuid4
    file_id = uuid4()
    p2p_key = str(file_id)
    
    # Optionally upload to P2P backend (best-effort) and also persist raw bytes in DB
    settings = get_settings()
    stored_path = None
    if settings.p2p_enabled:
        try:
            p2p_client = get_p2p_client()
            await p2p_client.upload_file(p2p_key, file_content)
            stored_path = p2p_key
        except Exception:
            # don't fail the request if P2P is down; we still persist bytes in DB
            stored_path = None

    # Store metadata and raw bytes in repository (DB-backed repo will persist data)
    meta = FileMetaCreate(
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        uploader_id=current_user.id,
        course_code=course_code,
        course_name=course_name,
        description=description,
        stored_path=stored_path,
        data=file_content,
    )
    # Create metadata with the file_id to ensure it matches the P2P key if provided
    created = await files_repo.create(meta, file_id=file_id)
    return created


@router.get("/{file_id}/download")
async def download_file(
    file_id: UUID,
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
):
    meta = await files_repo.get(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    
    # First try to get raw bytes from repository (DB-backed storage)
    file_bytes = await files_repo.get_data(file_id)
    if file_bytes is not None:
        return StreamingResponse(
            io.BytesIO(file_bytes),
            media_type=meta.content_type,
            headers={"Content-Disposition": f'attachment; filename="{meta.filename}"'}
        )

    # Otherwise, fallback to P2P backend using the stored key
    # Only attempt P2P fallback if P2P is enabled in settings
    settings = get_settings()
    if settings.p2p_enabled and meta.stored_path:
        p2p_client = get_p2p_client()
        file_content = await p2p_client.download_file(meta.stored_path)
        if file_content:
            return StreamingResponse(
                io.BytesIO(file_content),
                media_type=meta.content_type,
                headers={"Content-Disposition": f'attachment; filename="{meta.filename}"'}
            )

    raise HTTPException(status_code=404, detail="File not found")


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: UUID,
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
):
    meta = await files_repo.get(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    # Only the uploader may delete their file
    if meta.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this file")

    deleted = await files_repo.delete(file_id)
    if not deleted:
        raise HTTPException(status_code=500, detail="Failed to delete file")
    return
