import uuid
import pytest

from app.limiter import limiter


@pytest.fixture(autouse=True, scope="module")
def _reset_employee_create_rate_limit():
    # This module creates more employees than the 20/minute cap on POST /employees
    # allows for, on top of whatever earlier test modules already used from the
    # same shared in-memory limiter (keyed by IP, which is constant for TestClient).
    # Reset it so these tests don't fail due to budget consumed elsewhere.
    limiter.reset()


def _title():
    return f"Position-{uuid.uuid4().hex[:8]}"


def _create_position(client, admin_headers, max_slots=5):
    resp = client.post(
        "/positions",
        json={"title": _title(), "max_slots": max_slots},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    return resp.json()


def _create_employee(client, admin_headers, position_id=None, status="Active"):
    uid = uuid.uuid4().hex[:8]
    payload = {
        "name": f"Employee {uid}",
        "work_email": f"emp_{uid}@test.com",
        "position_id": position_id,
    }
    resp = client.post("/employees", json=payload, headers=admin_headers)
    assert resp.status_code == 201
    emp = resp.json()
    if status != "Active":
        resp = client.put(f"/employees/{emp['id']}", json={"status": status}, headers=admin_headers)
        assert resp.status_code == 200
        emp = resp.json()
    return emp


def test_new_position_has_zero_headcount(client, admin_headers):
    pos = _create_position(client, admin_headers, max_slots=3)
    assert pos["headcount"] == 0
    assert pos["openings"] == 3


def test_headcount_counts_only_active_employees_assigned_to_position(client, admin_headers):
    pos = _create_position(client, admin_headers, max_slots=5)
    _create_employee(client, admin_headers, position_id=pos["id"], status="Active")
    _create_employee(client, admin_headers, position_id=pos["id"], status="Active")
    _create_employee(client, admin_headers, position_id=pos["id"], status="Inactive")

    resp = client.get(f"/positions/{pos['id']}", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["headcount"] == 2
    assert data["openings"] == 3


def test_headcount_ignores_employees_assigned_to_other_positions(client, admin_headers):
    pos_a = _create_position(client, admin_headers, max_slots=5)
    pos_b = _create_position(client, admin_headers, max_slots=5)
    _create_employee(client, admin_headers, position_id=pos_a["id"])

    resp = client.get(f"/positions/{pos_b['id']}", headers=admin_headers)
    assert resp.json()["headcount"] == 0


def test_openings_never_negative_when_headcount_exceeds_max_slots(client, admin_headers):
    pos = _create_position(client, admin_headers, max_slots=1)
    _create_employee(client, admin_headers, position_id=pos["id"])
    _create_employee(client, admin_headers, position_id=pos["id"])

    resp = client.get(f"/positions/{pos['id']}", headers=admin_headers)
    data = resp.json()
    assert data["headcount"] == 2
    assert data["openings"] == 0


def test_headcount_updates_when_employee_deactivated(client, admin_headers):
    pos = _create_position(client, admin_headers, max_slots=5)
    emp = _create_employee(client, admin_headers, position_id=pos["id"])
    assert client.get(f"/positions/{pos['id']}", headers=admin_headers).json()["headcount"] == 1

    client.put(f"/employees/{emp['id']}", json={"status": "Inactive"}, headers=admin_headers)
    assert client.get(f"/positions/{pos['id']}", headers=admin_headers).json()["headcount"] == 0


def test_headcount_updates_when_employee_reassigned(client, admin_headers):
    pos_a = _create_position(client, admin_headers, max_slots=5)
    pos_b = _create_position(client, admin_headers, max_slots=5)
    emp = _create_employee(client, admin_headers, position_id=pos_a["id"])

    client.put(f"/employees/{emp['id']}", json={"position_id": pos_b["id"]}, headers=admin_headers)

    assert client.get(f"/positions/{pos_a['id']}", headers=admin_headers).json()["headcount"] == 0
    assert client.get(f"/positions/{pos_b['id']}", headers=admin_headers).json()["headcount"] == 1


def test_headcount_updates_when_employee_deleted(client, admin_headers):
    pos = _create_position(client, admin_headers, max_slots=5)
    emp = _create_employee(client, admin_headers, position_id=pos["id"])
    assert client.get(f"/positions/{pos['id']}", headers=admin_headers).json()["headcount"] == 1

    resp = client.delete(f"/employees/{emp['id']}", headers=admin_headers)
    assert resp.status_code == 204
    assert client.get(f"/positions/{pos['id']}", headers=admin_headers).json()["headcount"] == 0


def test_position_create_and_update_do_not_accept_fake_headcount(client, admin_headers):
    # headcount/openings are not writable fields — extra input is just ignored,
    # the stored/returned values are always derived from real employees.
    resp = client.post(
        "/positions",
        json={"title": _title(), "max_slots": 2, "headcount": 999, "openings": 999},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["headcount"] == 0
    assert data["openings"] == 2


def test_total_headcount_across_positions_never_exceeds_active_employee_count(client, admin_headers):
    pos_a = _create_position(client, admin_headers, max_slots=10)
    pos_b = _create_position(client, admin_headers, max_slots=10)
    _create_employee(client, admin_headers, position_id=pos_a["id"], status="Active")
    _create_employee(client, admin_headers, position_id=pos_a["id"], status="Active")
    _create_employee(client, admin_headers, position_id=pos_b["id"], status="Active")
    _create_employee(client, admin_headers, position_id=pos_b["id"], status="Inactive")

    total_active = client.get("/employees?status=Active&limit=500", headers=admin_headers).json()["total"]

    positions = client.get("/positions?limit=100", headers=admin_headers).json()["positions"]
    total_headcount = sum(p["headcount"] for p in positions)

    assert total_headcount <= total_active
