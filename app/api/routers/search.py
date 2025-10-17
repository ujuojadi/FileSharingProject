from __future__ import annotations

from fastapi import APIRouter, Depends, Query

from app.repositories.interfaces import FilesRepository
from app.services.deps import get_files_repo
from app.schemas.files import FileMeta

router = APIRouter(prefix="/search", tags=["search"])


@router.get("/files", response_model=list[FileMeta])
async def search_files(
    q: str | None = Query(None, description="Search in course code, course name, description"),
    course_code: str | None = Query(None),
    course_name: str | None = Query(None),
    files_repo: FilesRepository = Depends(get_files_repo),
) -> list[FileMeta]:
    results: list[FileMeta] = []
    all_files = await files_repo.list()

    def matches(meta: FileMeta) -> bool:
        if course_code and (meta.course_code or "").lower() != course_code.lower():
            return False
        if course_name and (meta.course_name or "").lower() != course_name.lower():
            return False
        if q:
            text = " ".join([
                meta.course_code or "",
                meta.course_name or "",
                meta.description or "",
                meta.filename,
            ]).lower()
            return q.lower() in text
        return True

    for m in all_files:
        if matches(m):
            results.append(m)
    return results
