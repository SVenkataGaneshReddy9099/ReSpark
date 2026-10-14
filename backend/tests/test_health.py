"""Health and metadata endpoint tests."""

def test_health_check(client):
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["service"] == "ReSpark"
    assert data["demo_mode"] is True

def test_api_prefix_compatibility(client):
    # Both /api/v1/health and /api/health should work
    res1 = client.get("/api/v1/health")
    res2 = client.get("/api/health")
    assert res1.status_code == 200
    assert res2.status_code == 200
    assert res1.json() == res2.json()
