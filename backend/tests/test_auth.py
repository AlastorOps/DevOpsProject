def test_login_success(client):
    resp = client.post("/auth/login", json={
        "email": "admin@company.com",
        "password": "TestAdmin@123456",
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "admin@company.com"
    assert data["user"]["role"] == "Admin"


def test_login_wrong_password(client):
    resp = client.post("/auth/login", json={
        "email": "admin@company.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


def test_login_unknown_email(client):
    resp = client.post("/auth/login", json={
        "email": "nobody@example.com",
        "password": "anypassword",
    })
    assert resp.status_code == 401


def test_me_returns_current_user(client, admin_headers):
    resp = client.get("/auth/me", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["email"] == "admin@company.com"
    assert data["role"] == "Admin"


def test_me_requires_auth(client):
    # HTTPBearer with auto_error=True returns 403 when no credentials are supplied.
    resp = client.get("/auth/me")
    assert resp.status_code == 403


def test_me_rejects_invalid_token(client):
    resp = client.get("/auth/me", headers={"Authorization": "Bearer not-a-real-token"})
    assert resp.status_code == 401


def test_refresh_issues_new_tokens(client):
    login = client.post("/auth/login", json={
        "email": "admin@company.com",
        "password": "TestAdmin@123456",
    })
    refresh_token = login.json()["refresh_token"]

    resp = client.post("/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    data = resp.json()
    assert "access_token" in data
    assert "refresh_token" in data


def test_refresh_rejects_invalid_token(client):
    resp = client.post("/auth/refresh", json={"refresh_token": "garbage"})
    assert resp.status_code == 401


def test_refresh_rejects_access_token_as_refresh(client):
    login = client.post("/auth/login", json={
        "email": "admin@company.com",
        "password": "TestAdmin@123456",
    })
    # Pass the access token where a refresh token is expected.
    access_token = login.json()["access_token"]
    resp = client.post("/auth/refresh", json={"refresh_token": access_token})
    assert resp.status_code == 401


def test_logout_succeeds(client, admin_headers):
    resp = client.post("/auth/logout", headers=admin_headers)
    assert resp.status_code == 200
