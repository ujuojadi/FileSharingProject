from __future__ import annotations

import os
from uuid import UUID
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException, Form, Query, Query
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
    group_id: str | None = Form(None),
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
    
    # Upload to P2P backend
    p2p_client = get_p2p_client()
    success = await p2p_client.upload_file(p2p_key, file_content)
    
    if not success:
        raise HTTPException(status_code=500, detail="Failed to upload file to P2P network")
    
    # Parse group_id if provided
    group_uuid = None
    if group_id:
        try:
            group_uuid = UUID(group_id)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid group_id format")
    
    # Store metadata with the pre-generated file_id
    meta = FileMetaCreate(
        filename=filename,
        content_type=file.content_type or "application/octet-stream",
        size_bytes=size,
        uploader_id=current_user.id,
        course_code=course_code,
        course_name=course_name,
        description=description,
        group_id=group_uuid,
        stored_path=p2p_key,  # Store P2P key instead of file path
    )
    # Create metadata with the file_id to ensure it matches the P2P key
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
    
    # Download from P2P backend using the stored key
    p2p_client = get_p2p_client()
    file_content = await p2p_client.download_file(meta.stored_path)
    
    if not file_content:
        raise HTTPException(status_code=404, detail="File not found in P2P network")
    
    # Return file as streaming response
    return StreamingResponse(
        io.BytesIO(file_content),
        media_type=meta.content_type,
        headers={"Content-Disposition": f'attachment; filename="{meta.filename}"'}
    )


@router.delete("/{file_id}", status_code=204)
async def delete_file(
    file_id: UUID,
    files_repo: FilesRepository = Depends(get_files_repo),
    current_user: User = Depends(get_current_verified_user),
):
    """Delete a file from both FastAPI metadata and P2P network."""
    meta = await files_repo.get(file_id)
    if not meta:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if user owns the file (optional: allow admins to delete any file)
    if meta.uploader_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete your own files")
    
    # Delete from P2P network first
    p2p_client = get_p2p_client()
    p2p_deleted = await p2p_client.delete_file(meta.stored_path)
    
    if not p2p_deleted:
        # Log warning but continue with metadata deletion
        print(f"Warning: Failed to delete file {file_id} from P2P network, but continuing with metadata deletion")
    
    # Delete metadata from repository
    deleted = await files_repo.delete(file_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="File not found")
    
    return None  # 204 No Content