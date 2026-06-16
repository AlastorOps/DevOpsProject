"""
Leave request tests.

POST /leave accepts multipart/form-data — pass data= (not json=) to TestClient.
Dates must be today or later, so we anchor everything on a fixed future date.
"""
from datetime import date, timedelta


def _future(offset_days=10):
    """Return a date ``offset_days`` from today (always in the future)."""
    return (date.today() + timedelta(days=offset_days)).isoformat()


def _create_employee(client, headers):
    """Helper: create a throwaway employee and return its id."""
    import uuid
    uid = uuid.uuid4().hex[:8]
    resp = client.post(
        "/employees",
        json={"name": f"Leave Tester {uid}", "work_email": f"lv_{uid}@test.com"},
        headers=headers,
    )
    assert resp.status_code == 201, resp.text
    return resp.json()["id"]


# ── List ──────────────────────────────────────────────────────────────────────

def test_list_leave_requires_auth(client):
    resp = client.get("/leave")
    assert resp.status_code == 403


def test_list_leave_returns_structure(client, admin_headers):
    resp = client.get("/leave", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "requests" in data
    assert "total" in data
    assert "page" in data
    assert "limit" in data


# ── Create ────────────────────────────────────────────────────────────────────

def test_create_leave_request(client, admin_headers):
    emp_id = _create_employee(client, admin_headers)

    resp = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Annual Leave",
            "from_date": _future(10),
            "to_date": _future(12),
            "reason": "Family vacation",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201, resp.text
    data = resp.json()
    assert data["leave_type"] == "Annual Leave"
    assert data["status"] == "Pending"
    assert data["days"] == 3
    assert data["leave_id"].startswith("LV-")


def test_create_leave_request_single_day(client, admin_headers):
    emp_id = _create_employee(client, admin_headers)
    tomorrow = _future(1)

    resp = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Sick Leave",
            "from_date": tomorrow,
            "to_date": tomorrow,
            "reason": "Not feeling well",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 201
    assert resp.json()["days"] == 1


def test_create_leave_invalid_date_order(client, admin_headers):
    """to_date before from_date should fail."""
    emp_id = _create_employee(client, admin_headers)

    resp = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Annual Leave",
            "from_date": _future(15),
            "to_date": _future(10),  # earlier than from_date
            "reason": "Bad dates",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_create_leave_past_date_rejected(client, admin_headers):
    emp_id = _create_employee(client, admin_headers)
    yesterday = (date.today() - timedelta(days=1)).isoformat()

    resp = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Annual Leave",
            "from_date": yesterday,
            "to_date": _future(5),
            "reason": "Retroactive request",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 422


def test_create_leave_nonexistent_employee(client, admin_headers):
    resp = client.post(
        "/leave",
        data={
            "employee_id": "00000000-0000-0000-0000-000000000000",
            "leave_type": "Annual Leave",
            "from_date": _future(10),
            "to_date": _future(12),
            "reason": "Ghost request",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 404


# ── Status update (approve / reject) ─────────────────────────────────────────

def test_approve_leave_request(client, admin_headers):
    emp_id = _create_employee(client, admin_headers)

    created = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Personal Leave",
            "from_date": _future(20),
            "to_date": _future(21),
            "reason": "Personal matters",
        },
        headers=admin_headers,
    ).json()

    resp = client.put(
        f"/leave/{created['id']}/status",
        json={"status": "Approved"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "Approved"


def test_reject_leave_request(client, admin_headers):
    emp_id = _create_employee(client, admin_headers)

    created = client.post(
        "/leave",
        data={
            "employee_id": emp_id,
            "leave_type": "Emergency Leave",
            "from_date": _future(5),
            "to_date": _future(7),
            "reason": "Emergency situation",
        },
        headers=admin_headers,
    ).json()

    resp = client.put(
        f"/leave/{created['id']}/status",
        json={"status": "Rejected", "rejection_reason": "Insufficient notice"},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.json()["status"] == "Rejected"


def test_status_update_nonexistent_leave(client, admin_headers):
    resp = client.put(
        "/leave/00000000-0000-0000-0000-000000000000/status",
        json={"status": "Approved"},
        headers=admin_headers,
    )
    assert resp.status_code == 404


# ── Filtering ─────────────────────────────────────────────────────────────────

def test_filter_by_status(client, admin_headers):
    resp = client.get("/leave?status=Pending", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    for req in data["requests"]:
        assert req["status"] == "Pending"


def test_filter_by_leave_type(client, admin_headers):
    resp = client.get("/leave?leave_type=Annual+Leave", headers=admin_headers)
    assert resp.status_code == 200
    for req in resp.json()["requests"]:
        assert req["leave_type"] == "Annual Leave"
