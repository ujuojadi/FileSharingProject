from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from app.repositories.interfaces import FeedbackRepository, FilesRepository
from app.services.deps import get_feedback_repo, get_files_repo
from app.services.auth import get_current_verified_user
from app.schemas.feedback import Feedback, FeedbackCreate, FeedbackUpdate
from app.schemas.user import User

router = APIRouter(prefix="/feedback", tags=["feedback"])


@router.post("/", response_model=Feedback, status_code=201)
async def submit_feedback(
    data: FeedbackCreate,
    current_user: User = Depends(get_current_verified_user),
    feedback_repo: FeedbackRepository = Depends(get_feedback_repo),
    files_repo: FilesRepository = Depends(get_files_repo),
) -> Feedback:
    # Ensure file exists
    file_meta = await files_repo.get(data.file_id)
    if not file_meta:
        raise HTTPException(status_code=404, detail="File not found")
    if data.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Cannot submit feedback for another user")
    return await feedback_repo.create(data)


@router.patch("/{feedback_id}", response_model=Feedback)
async def edit_feedback(
    feedback_id: UUID,
    data: FeedbackUpdate,
    current_user: User = Depends(get_current_verified_user),
    feedback_repo: FeedbackRepository = Depends(get_feedback_repo),
) -> Feedback:
    existing = await feedback_repo.update(feedback_id, data)
    if not existing:
        raise HTTPException(status_code=404, detail="Feedback not found")
    # Note: In memory we do not track ownership; in real DB enforce author
    return existing


@router.get("/file/{file_id}", response_model=list[Feedback])
async def list_feedback(file_id: UUID, feedback_repo: FeedbackRepository = Depends(get_feedback_repo)) -> list[Feedback]:
    return await feedback_repo.list_for_file(file_id)


@router.get("/file/{file_id}/average", response_model=dict)
async def average_rating(file_id: UUID, feedback_repo: FeedbackRepository = Depends(get_feedback_repo)) -> dict:
    avg = await feedback_repo.average_for_file(file_id)
    return {"average": avg}
