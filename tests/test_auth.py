import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.memory.users import InMemoryUsersRepository
from app.services.deps import get_users_repo


def test_register_and_login():
    # Use an in-memory users repo for the test so we don't depend on DB setup
    repo = InMemoryUsersRepository()
    app.dependency_overrides[get_users_repo] = lambda: repo

    with TestClient(app) as client:
        # Register
        r = client.post("/auth/register", json={
            "email": "tester@ul.edu",
            "full_name": "Tester",
            "password": "password123",
        })
        assert r.status_code == 201, r.text

        # Login (OAuth2 form expected)
        r2 = client.post(
            "/auth/login",
            data={"username": "tester@ul.edu", "password": "password123"},
        )
        assert r2.status_code == 200, r2.text
        body = r2.json()
        assert "access_token" in body

    app.dependency_overrides.clear()
