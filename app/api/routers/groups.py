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
    # Create the group
    group = await groups_repo.create(data)
    # Automatically add creator as a member
    await groups_repo.join(group.id, current_user.id)
    return group


@router.post("/{group_id}/join", response_model=GroupMembership)
async def join_group(group_id: UUID, groups_repo: GroupsRepository = Depends(get_groups_repo), current_user: User = Depends(get_current_verified_user)) -> GroupMembership:
    # In-memory repo does not validate group existence strictly; assume creation done before
    return await groups_repo.join(group_id, current_user.id)


@router.get("/", response_model=list[Group])
async def list_groups(groups_repo: GroupsRepository = Depends(get_groups_repo)) -> list[Group]:
    return await groups_repo.list_groups()


@router.get("/me", response_model=list[Group])
async def get_my_groups(
    groups_repo: GroupsRepository = Depends(get_groups_repo),
    current_user: User = Depends(get_current_verified_user),
) -> list[Group]:
    """Get all groups the current user is a member of"""
    all_groups = await groups_repo.list_groups()
    # Check membership via internal structure (in-memory) or via members() method
    my_groups = []
    if hasattr(groups_repo, "_members_by_group"):
        # In-memory repo
        members_by_group = getattr(groups_repo, "_members_by_group")
        for group in all_groups:
            if current_user.id in members_by_group.get(group.id, []):
                my_groups.append(group)
    else:
        # SQL repo - check membership via members() method
        for group in all_groups:
            try:
                members = await groups_repo.members(group.id)
                if any(m.id == current_user.id for m in members):
                    my_groups.append(group)
            except Exception:
                continue
    return my_groups


@router.get("/{group_id}/members/count", response_model=dict)
async def get_group_member_count(
    group_id: UUID,
    groups_repo: GroupsRepository = Depends(get_groups_repo),
) -> dict:
    """Get the number of members in a group"""
    if hasattr(groups_repo, "_members_by_group"):
        # In-memory repo
        members_by_group = getattr(groups_repo, "_members_by_group")
        count = len(members_by_group.get(group_id, []))
    else:
        # SQL repo
        try:
            members = await groups_repo.members(group_id)
            count = len(members)
        except Exception:
            count = 0
    return {"group_id": str(group_id), "member_count": count}


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
