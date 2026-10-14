"""Tests for match state machine, transactional integrity, and over-allocation guards."""

from app.models.enums import MatchStatus, AvailabilityStatus, NeedStatus

def test_match_state_machine_happy_path(client):
    # Match 3 is pre-seeded in SUGGESTED status (CLRS Algorithms Book with Need 1)
    match_id = 3

    # 1. Express Interest
    res1 = client.post(f"/api/v1/matches/{match_id}/action", json={"status": "interest_expressed", "notes": "Interested in meeting tomorrow"})
    assert res1.status_code == 200
    assert res1.json()["status"] == "interest_expressed"

    # 2. Accept Match
    res2 = client.post(f"/api/v1/matches/{match_id}/action", json={"status": "accepted", "notes": "Handoff confirmed at library"})
    assert res2.status_code == 200
    assert res2.json()["status"] == "accepted"

    # Verify resource is now marked RESERVED because all remaining quantity is allocated
    res_detail = client.get("/api/v1/resources/1").json()
    assert res_detail["allocated_quantity"] == 1.0
    assert res_detail["remaining_quantity"] == 0.0
    assert res_detail["availability_status"] == "reserved"

    # 3. Complete Match
    res3 = client.post(f"/api/v1/matches/{match_id}/action", json={"status": "completed", "notes": "Successfully handed off"})
    assert res3.status_code == 200
    assert res3.json()["status"] == "completed"

    # Verify resource and need are COMPLETED / FULFILLED
    res_final = client.get("/api/v1/resources/1").json()
    assert res_final["availability_status"] == "completed"

    need_final = client.get("/api/v1/needs/1").json()
    assert need_final["status"] == "fulfilled"
    assert need_final["quantity_fulfilled"] == 1.0


def test_invalid_status_transition(client):
    # Match 1 is already COMPLETED in seed data
    match_id = 1
    # Trying to change COMPLETED -> SUGGESTED should fail
    res = client.post(f"/api/v1/matches/{match_id}/action", json={"status": "suggested"})
    assert res.status_code == 400
    assert "Invalid match transition" in res.json()["detail"]


def test_over_allocation_prevention(client):
    # Create a resource with quantity 1
    res = client.post("/api/v1/resources", json={
        "provider_id": 1,
        "title": "Single Scientific Calculator",
        "description": "TI-84 Plus CE graphing calculator in perfect working order.",
        "category": "electronics",
        "resource_type": "physical_item",
        "quantity": 1.0,
        "unit": "unit",
        "location": "University Campus"
    }).json()

    need = client.post("/api/v1/needs", json={
        "requester_id": 4,
        "title": "Graphing Calculators for Study Group",
        "description": "Need graphing calculators for chemistry and physics lab.",
        "category": "electronics",
        "resource_type": "physical_item",
        "quantity_requested": 3.0,
        "unit": "units",
        "location": "University Campus"
    }).json()

    # Generate matches to link them
    gen = client.post("/api/v1/matches/generate").json()
    matches = client.get(f"/api/v1/matches?resource_id={res['id']}&need_id={need['id']}").json()
    assert len(matches) > 0
    test_match = matches[0]

    # Express interest
    client.post(f"/api/v1/matches/{test_match['id']}/action", json={"status": "interest_expressed"})

    # Attempt to accept with allocated_quantity 5.0 (greater than the 1.0 available)
    bad_accept = client.post(f"/api/v1/matches/{test_match['id']}/action", json={
        "status": "accepted",
        "allocated_quantity": 5.0
    })
    assert bad_accept.status_code == 409
    assert "over-allocation" in bad_accept.json()["detail"].lower()
