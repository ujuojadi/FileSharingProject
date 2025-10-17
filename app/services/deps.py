from __future__ import annotations

from fastapi import Depends

from app.repositories.interfaces import UsersRepository, FilesRepository, FeedbackRepository, GroupsRepository
from app.repositories.memory.users import InMemoryUsersRepository
from app.repositories.memory.files import InMemoryFilesRepository
from app.repositories.memory.feedback import InMemoryFeedbackRepository
from app.repositories.memory.groups import InMemoryGroupsRepository

# Singletons for process lifetime (in-memory)
_users_repo = InMemoryUsersRepository()
_files_repo = InMemoryFilesRepository()
_feedback_repo = InMemoryFeedbackRepository()
_groups_repo = InMemoryGroupsRepository()


def get_users_repo() -> UsersRepository:
    return _users_repo


def get_files_repo() -> FilesRepository:
    return _files_repo


def get_feedback_repo() -> FeedbackRepository:
    return _feedback_repo


def get_groups_repo() -> GroupsRepository:
    return _groups_repo
