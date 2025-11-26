from __future__ import annotations

from fastapi import Depends

from app.repositories.interfaces import UsersRepository, FilesRepository, FeedbackRepository, GroupsRepository
from app.repositories.memory.users import InMemoryUsersRepository
from app.repositories.memory.files import InMemoryFilesRepository
from app.repositories.memory.feedback import InMemoryFeedbackRepository
from app.repositories.memory.groups import InMemoryGroupsRepository
from app.repositories.sql.users import SQLUsersRepository
from app.core.config import get_settings

settings = get_settings()

# Singletons for process lifetime (in-memory)
_users_repo: object
# For now, use in-memory repository to avoid database setup issues
# TODO: Switch to SQL repository once database is properly configured
_users_repo = InMemoryUsersRepository()
# Uncomment below to use SQL repository when database is ready:
# if settings.database_url and not settings.database_url.startswith("mysql"):
#     _users_repo = SQLUsersRepository()
# else:
#     _users_repo = InMemoryUsersRepository()
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
