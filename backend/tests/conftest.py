import os
import time

# Must be set before any app module is imported — pydantic-settings reads env at import time.
_HERE = os.path.dirname(os.path.abspath(__file__))
_TEST_DB = os.path.join(_HERE, "test_ems.db")

os.environ["DATABASE_URL"] = f"sqlite:///{_TEST_DB}"
os.environ["SECRET_KEY"] = "CI0Pytest0Session0Auth0X7k2m9n4q8v3w5j6"
os.environ["ADMIN_PASSWORD"] = "TestAdmin@123456"
os.environ.setdefault("CORS_ORIGINS", '["http://localhost:5173"]')

# Remove stale DB from a previous run so each session starts clean.
if os.path.exists(_TEST_DB):
    os.remove(_TEST_DB)

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import engine


def _remove_test_db_files():
    for path in [_TEST_DB, _TEST_DB + "-shm", _TEST_DB + "-wal"]:
        for attempt in range(5):
            try:
                if os.path.exists(path):
                    os.remove(path)
                break
            except PermissionError:
                if attempt == 4:
                    raise
                time.sleep(0.1)


@pytest.fixture(scope="session")
def client():
    """Single TestClient for the whole test session; lifespan runs once."""
    with TestClient(app, raise_server_exceptions=True) as c:
        yield c
    engine.dispose()
    # Cleanup test database file after all tests finish.
    _remove_test_db_files()


@pytest.fixture(scope="session")
def admin_headers(client):
    """Bearer token for the admin user seeded by the app lifespan."""
    resp = client.post("/auth/login", json={
        "email": "admin@company.com",
        "password": "TestAdmin@123456",
    })
    assert resp.status_code == 200, f"Admin login failed: {resp.text}"
    return {"Authorization": f"Bearer {resp.json()['access_token']}"}
