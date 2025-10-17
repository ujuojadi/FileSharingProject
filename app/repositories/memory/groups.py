from __future__ import annotations

from typing import Optional
from uuid import UUID

from app.schemas.groups import Group, GroupCreate, GroupMembership
from app.schemas.user import UserPublic


class InMemoryGroupsRepository:
    def __init__(self) -> None:
        self._groups_by_id: dict[UUID, Group] = {}
        self._members_by_group: dict[UUID, list[UUID]] = {}

    async def create(self, data: GroupCreate) -> Group:
        group = Group(**data.model_dump())
        self._groups_by_id[group.id] = group
        self._members_by_group.setdefault(group.id, [])
        return group

    async def join(self, group_id: UUID, user_id: UUID) -> GroupMembership:
        self._members_by_group.setdefault(group_id, [])
        if user_id not in self._members_by_group[group_id]:
            self._members_by_group[group_id].append(user_id)
        return GroupMembership(group_id=group_id, user_id=user_id)

    async def list_groups(self) -> list[Group]:
        return list(self._groups_by_id.values())

    async def members(self, group_id: UUID) -> list[UserPublic]:
        # In memory, we can't fully materialize UserPublic without a users repo passed in.
        # This will be wired via service layer where both repos are accessible.
        raise NotImplementedError("Use service to get members with users repo")
