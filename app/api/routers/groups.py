from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException

from app.repositories.interfaces import GroupsRepository, FilesRepository, UsersRepository
from app.services.deps import get_groups_repo, get_files_repo, get_users_repo
from app.services.auth import get_current_verified_user
from app.schemas.groups import Group, GroupCreate, GroupMembership
from app.schemas.files import FileMeta
from app.schemas.user import User

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=Group, status_code=201)
async def create_group(data: GroupCreate, groups_repo: GroupsRepository = Depends(get_groups_repo), current_user: User = Depends(get_current_verified_user)) -> Group:
    # current_user not used, but ensures only verified users can create
    return await groups_repo.create(data)


@router.post("/{group_id}/join", response_model=GroupMembership)
async def join_group(group_id: UUID, groups_repo: GroupsRepository = Depends(get_groups_repo), current_user: User = Depends(get_current_verified_user)) -> GroupMembership:
    # In-memory repo does not validate group existence strictly; assume creation done before
    return await groups_repo.join(group_id, current_user.id)


@router.get("/", response_model=list[Group])
async def list_groups(groups_repo: GroupsRepository = Depends(get_groups_repo)) -> list[Group]:
    return await groups_repo.list_groups()


@router.get("/{group_id}/recommendations", response_model=list[FileMeta])
async def group_recommendations(
    group_id: UUID,
    groups_repo: GroupsRepository = Depends(get_groups_repo),
    files_repo: FilesRepository = Depends(get_files_repo),
    users_repo: UsersRepository = Depends(get_users_repo),
) -> list[FileMeta]:
    # Simulate: recommend files uploaded by members of the group
    # Since groups_repo.members requires service, we'll emulate members lookup via internal structure:
    # We'll rely on the internal attribute if present (only for in-memory). For production, replace with service.
    if not hasattr(groups_repo, "_members_by_group"):
        return []
    member_ids = getattr(groups_repo, "_members_by_group").get(group_id, [])
    results: list[FileMeta] = []
    for user_id in member_ids:
        files = await files_repo.list_by_uploader(user_id)
        results.extend(files)
    return results
