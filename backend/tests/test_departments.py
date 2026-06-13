import uuid


def _name():
    return f"Dept-{uuid.uuid4().hex[:8]}"


def test_list_departments(client, admin_headers):
    resp = client.get("/departments", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "departments" in data
    assert "total" in data
    assert "page" in data


def test_list_departments_requires_auth(client):
    resp = client.get("/departments")
    assert resp.status_code == 403


def test_create_department(client, admin_headers):
    name = _name()
    resp = client.post("/departments", json={"name": name}, headers=admin_headers)
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == name
    assert data["employee_count"] == 0
    assert "id" in data


def test_create_department_duplicate_name(client, admin_headers):
    name = _name()
    client.post("/departments", json={"name": name}, headers=admin_headers)
    resp = client.post("/departments", json={"name": name}, headers=admin_headers)
    assert resp.status_code == 409


def test_get_department(client, admin_headers):
    name = _name()
    dept_id = client.post("/departments", json={"name": name}, headers=admin_headers).json()["id"]

    resp = client.get(f"/departments/{dept_id}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == name


def test_get_nonexistent_department(client, admin_headers):
    resp = client.get("/departments/999999", headers=admin_headers)
    assert resp.status_code == 404


def test_update_department_name(client, admin_headers):
    dept_id = client.post("/departments", json={"name": _name()}, headers=admin_headers).json()["id"]

    new_name = _name()
    resp = client.put(f"/departments/{dept_id}", json={"name": new_name}, headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["name"] == new_name


def test_update_department_with_head_and_budget(client, admin_headers):
    dept_id = client.post("/departments", json={"name": _name()}, headers=admin_headers).json()["id"]

    resp = client.put(
        f"/departments/{dept_id}",
        json={"head": "Jane Doe", "budget": "50000.00"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["head"] == "Jane Doe"


def test_update_nonexistent_department(client, admin_headers):
    resp = client.put("/departments/999999", json={"name": _name()}, headers=admin_headers)
    assert resp.status_code == 404


def test_delete_department(client, admin_headers):
    dept_id = client.post("/departments", json={"name": _name()}, headers=admin_headers).json()["id"]

    resp = client.delete(f"/departments/{dept_id}", headers=admin_headers)
    assert resp.status_code == 204

    # Confirm it is gone.
    resp = client.get(f"/departments/{dept_id}", headers=admin_headers)
    assert resp.status_code == 404


def test_delete_nonexistent_department(client, admin_headers):
    resp = client.delete("/departments/999999", headers=admin_headers)
    assert resp.status_code == 404


def test_search_departments(client, admin_headers):
    unique = uuid.uuid4().hex[:8]
    client.post("/departments", json={"name": f"Searchable-{unique}"}, headers=admin_headers)

    resp = client.get(f"/departments?search=Searchable-{unique}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.json()["total"] >= 1


# --- Budget validation ---

def test_create_department_negative_budget_rejected(client, admin_headers):
    resp = client.post(
        "/departments",
        json={"name": _name(), "budget": "-1"},
        headers=admin_headers,
    )
    assert resp.status_code == 422
    body = resp.json()
    assert any("negative" in str(e.get("msg", "")).lower() for e in body["detail"])


def test_update_department_negative_budget_rejected(client, admin_headers):
    dept_id = client.post("/departments", json={"name": _name()}, headers=admin_headers).json()["id"]
    resp = client.put(
        f"/departments/{dept_id}",
        json={"budget": "-500"},
        headers=admin_headers,
    )
    assert resp.status_code == 422
    body = resp.json()
    assert any("negative" in str(e.get("msg", "")).lower() for e in body["detail"])


def test_create_department_zero_budget_allowed(client, admin_headers):
    resp = client.post(
        "/departments",
        json={"name": _name(), "budget": "0"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert float(resp.json()["budget"]) == 0.0


def test_create_department_positive_budget_allowed(client, admin_headers):
    resp = client.post(
        "/departments",
        json={"name": _name(), "budget": "75000.50"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert float(resp.json()["budget"]) == 75000.50


def test_create_department_null_budget_allowed(client, admin_headers):
    resp = client.post(
        "/departments",
        json={"name": _name(), "budget": None},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["budget"] is None
