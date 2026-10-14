"""Tests for dashboard statistics and community impact calculations."""

def test_dashboard_statistics(client):
    res = client.get("/api/v1/stats/dashboard")
    assert res.status_code == 200
    data = res.json()

    assert data["total_resources"] >= 7
    assert data["available_resources"] >= 5
    assert data["total_needs"] >= 6
    assert data["open_needs"] >= 4
    assert data["completed_matches"] >= 1
    assert data["resources_reused_count"] >= 1
    assert data["estimated_waste_avoided_kg"] > 0
    assert "waste_avoided_methodology" in data
    assert len(data["category_breakdown"]) > 0
    assert len(data["match_pipeline"]) > 0


def test_impact_statistics(client):
    res = client.get("/api/v1/stats/impact")
    assert res.status_code == 200
    data = res.json()

    assert data["total_completed_matches"] >= 1
    assert data["community_members_helped"] >= 2
    assert data["estimated_waste_avoided_kg"] > 0
    assert data["estimated_co2_avoided_kg"] > 0
    assert "methodology_assumptions" in data
    assert len(data["category_impact"]) > 0


def test_stats_update_dynamically_after_completion(client):
    # Get initial metrics
    initial_stats = client.get("/api/v1/stats/dashboard").json()
    init_completed = initial_stats["completed_matches"]
    init_waste = initial_stats["estimated_waste_avoided_kg"]

    # Match 3 (CLRS Algorithms book, 1.8kg) is in SUGGESTED
    client.post("/api/v1/matches/3/action", json={"status": "interest_expressed"})
    client.post("/api/v1/matches/3/action", json={"status": "accepted"})
    client.post("/api/v1/matches/3/action", json={"status": "completed"})

    # Check updated metrics
    updated_stats = client.get("/api/v1/stats/dashboard").json()
    assert updated_stats["completed_matches"] == init_completed + 1
    assert updated_stats["estimated_waste_avoided_kg"] > init_waste
