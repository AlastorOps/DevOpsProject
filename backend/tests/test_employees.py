import uuid


def _payload(suffix=None):
    uid = suffix or uuid.uuid4().hex[:8]
    return {
        "name": f"Employee {uid}",
        "work_email": f"emp_{uid}@test.com",
        "employment_type": "Full-Time",
    }


def test_list_employees(client, admin_headers):
    resp = client.get("/employees", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "employees" in data
    assert "total" in data
    assert data["page"] == 1
    assert data["limit"] == 10


def test_list_employees_requires_auth(client):
    resp = client.get("/employees")
    assert resp.status_code == 403


def test_create_employee(client, admin_headers):
    payload = _payload()
    resp = client.post("/employees", json=payload, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == payload["name"]
    assert data["work_email"] == payload["work_email"]
    assert data["status"] == "Active"
    assert data["emp_id"].startswith("EMP-")


def test_create_employee_auto_generates_emp_id(client, admin_headers):
    resp1 = client.post("/employees", json=_payload(), headers=admin_headers)
    resp2 = client.post("/employees", json=_payload(), headers=admin_headers)
    assert resp1.status_code == 201
    assert resp2.status_code == 201
    # IDs must be unique.
    assert resp1.json()["emp_id"] != resp2.json()["emp_id"]


def test_create_employee_duplicate_work_email(client, admin_headers):
    uid = uuid.uuid4().hex[:8]
    payload = _payload(uid)
    client.post("/employees", json=payload, headers=admin_headers)
    resp = client.post("/employees", json=payload, headers=admin_headers)
    assert resp.status_code == 409


def test_create_employee_with_user_account(client, admin_headers):
    uid = uuid.uuid4().hex[:8]
    payload = {
        "name": f"UserEmp {uid}",
        "work_email": f"usermp_{uid}@test.com",
        "user_password": "Password@123",
        "user_role": "Employee",
        "account_active": True,
    }
    resp = client.post("/employees", json=payload, headers=admin_headers)
    assert resp.status_code == 201


def test_get_employee(client, admin_headers):
    created = client.post("/employees", json=_payload(), headers=admin_headers).json()

    resp = client.get(f"/employees/{created['id']}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == created["id"]


def test_get_nonexistent_employee(client, admin_headers):
    resp = client.get("/employees/00000000-0000-0000-0000-000000000000", headers=admin_headers)
    assert resp.status_code == 404


def test_update_employee_name(client, admin_headers):
    created = client.post("/employees", json=_payload(), headers=admin_headers).json()

    resp = client.put(
        f"/employees/{created['id']}",
        json={"name": "Updated Name"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["name"] == "Updated Name"


def test_update_employee_status(client, admin_headers):
    created = client.post("/employees", json=_payload(), headers=admin_headers).json()

    resp = client.put(
        f"/employees/{created['id']}",
        json={"status": "Inactive"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "Inactive"


def test_update_nonexistent_employee(client, admin_headers):
    resp = client.put(
        "/employees/00000000-0000-0000-0000-000000000000",
        json={"name": "Ghost"},
        headers=admin_headers,
    )
    assert resp.status_code == 404


def test_delete_employee(client, admin_headers):
    created = client.post("/employees", json=_payload(), headers=admin_headers).json()

    resp = client.delete(f"/employees/{created['id']}", headers=admin_headers)
    assert resp.status_code == 204

    resp = client.get(f"/employees/{created['id']}", headers=admin_headers)
    assert resp.status_code == 404


def test_delete_nonexistent_employee(client, admin_headers):
    resp = client.delete(
        "/employees/00000000-0000-0000-0000-000000000000",
        headers=admin_headers,
    )
    assert resp.status_code == 404


def test_search_employees_by_name(client, admin_headers):
    uid = uuid.uuid4().hex[:8]
    client.post("/employees", json={"name": f"Searchable {uid}"}, headers=admin_headers)

    resp = client.get(f"/employees?search=Searchable+{uid}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


def test_list_employees_pagination(client, admin_headers):
    resp = client.get("/employees?page=1&limit=5", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["limit"] == 5
    assert len(data["employees"]) <= 5
