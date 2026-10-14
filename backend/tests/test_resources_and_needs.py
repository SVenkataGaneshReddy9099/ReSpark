"""Tests for Resource and Need CRUD, validation, and search/filtering."""

from app.models.enums import Category, ResourceType, Condition, Urgency, AvailabilityStatus, NeedStatus

def test_list_resources(client):
    response = client.get("/api/v1/resources")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 7
    # Verify field structure
    first = items[0]
    assert "title" in first
    assert "remaining_quantity" in first
    assert "category" in first

def test_filter_resources_by_category(client):
    response = client.get("/api/v1/resources?category=textbooks")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 2
    for item in items:
        assert item["category"] == "textbooks"

def test_search_resources_by_keyword(client):
    response = client.get("/api/v1/resources?q=Algorithms")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 1
    assert "Algorithms" in items[0]["title"]

def test_create_resource_validation(client):
    # Missing required fields
    invalid_payload = {"title": "A"}
    res = client.post("/api/v1/resources", json=invalid_payload)
    assert res.status_code == 422

    # Non-existent provider
    nonexistent_user_payload = {
        "provider_id": 9999,
        "title": "Discrete Mathematics Handbook",
        "description": "Thorough textbook on discrete mathematics with practice solutions.",
        "category": "textbooks",
        "resource_type": "physical_item",
        "quantity": 1.0,
        "unit": "book",
        "condition": "good",
        "location": "North Campus",
    }
    res2 = client.post("/api/v1/resources", json=nonexistent_user_payload)
    assert res2.status_code == 404

    # Valid creation
    valid_payload = {
        "provider_id": 1,
        "title": "Discrete Mathematics Handbook",
        "description": "Thorough textbook on discrete mathematics with practice solutions.",
        "category": "textbooks",
        "resource_type": "physical_item",
        "quantity": 2.0,
        "unit": "books",
        "condition": "good",
        "location": "North Campus",
    }
    res3 = client.post("/api/v1/resources", json=valid_payload)
    assert res3.status_code == 201
    created = res3.json()
    assert created["title"] == "Discrete Mathematics Handbook"
    assert created["remaining_quantity"] == 2.0
    assert created["availability_status"] == "available"

def test_list_and_create_need(client):
    response = client.get("/api/v1/needs")
    assert response.status_code == 200
    items = response.json()
    assert len(items) >= 6

    # Create new need
    valid_need = {
        "requester_id": 4,
        "title": "Calculus 1 Solution Guide Needed",
        "description": "Looking for Stewart Calculus solution manual for freshman calculus course.",
        "category": "textbooks",
        "resource_type": "physical_item",
        "quantity_requested": 1.0,
        "unit": "book",
        "location": "University Campus",
        "urgency": "high",
        "required_by": "2026-11-01",
    }
    create_res = client.post("/api/v1/needs", json=valid_need)
    assert create_res.status_code == 201
    created = create_res.json()
    assert created["status"] == "open"
    assert created["remaining_requested"] == 1.0
