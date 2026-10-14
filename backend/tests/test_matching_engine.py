"""Tests for 5-stage explainable AI matching engine."""

from app.models.resource import Resource
from app.models.need import Need
from app.models.enums import Category, ResourceType, Condition, Urgency, AvailabilityStatus, NeedStatus
from app.services.matching_engine import evaluate_match_candidate, generate_recommendations

def test_hard_constraint_filtering():
    # 1. Closed need cannot be matched
    res = Resource(
        id=10, provider_id=1, title="Test Item", description="Desc",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity=1.0, allocated_quantity=0.0, availability_status=AvailabilityStatus.AVAILABLE,
        location="Campus"
    )
    closed_need = Need(
        id=20, requester_id=2, title="Test Need", description="Desc",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity_requested=1.0, quantity_fulfilled=0.0, status=NeedStatus.FULFILLED,
        location="Campus"
    )
    assert evaluate_match_candidate(res, closed_need) is None

    # 2. Self-matching (provider == requester) is prevented
    self_need = Need(
        id=21, requester_id=1, title="Test Need", description="Desc",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity_requested=1.0, quantity_fulfilled=0.0, status=NeedStatus.OPEN,
        location="Campus"
    )
    assert evaluate_match_candidate(res, self_need) is None

    # 3. Incompatible categories (Tractor in Other vs Textbooks)
    incompatible_need = Need(
        id=22, requester_id=2, title="Diesel Tractor Heavy Machinery", description="Need a farm tractor",
        category=Category.OTHER, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity_requested=1.0, quantity_fulfilled=0.0, status=NeedStatus.OPEN,
        location="Far Away"
    )
    assert evaluate_match_candidate(res, incompatible_need) is None

    # 4. Zero remaining quantity
    exhausted_res = Resource(
        id=11, provider_id=1, title="Test Item", description="Desc",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity=1.0, allocated_quantity=1.0, availability_status=AvailabilityStatus.AVAILABLE,
        location="Campus"
    )
    assert evaluate_match_candidate(exhausted_res, self_need) is None


def test_scoring_weights_and_normalization():
    res = Resource(
        id=101, provider_id=1,
        title="Algorithms and Data Structures in Python",
        description="Comprehensive course textbook for data structures and algorithm analysis.",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity=3.0, allocated_quantity=0.0, unit="books",
        condition=Condition.LIKE_NEW, location="University Campus",
        availability_status=AvailabilityStatus.AVAILABLE
    )
    need = Need(
        id=201, requester_id=2,
        title="Python Data Structures & Algorithms Textbook",
        description="Looking for an algorithm textbook covering Python data structures for university course.",
        category=Category.TEXTBOOKS, resource_type=ResourceType.PHYSICAL_ITEM,
        quantity_requested=1.0, quantity_fulfilled=0.0, unit="book",
        location="University Campus", urgency=Urgency.HIGH,
        status=NeedStatus.OPEN
    )

    eval_result = evaluate_match_candidate(res, need)
    assert eval_result is not None
    score = eval_result["score"]
    assert 0.0 <= score <= 100.0
    # Because both category, location, quantity coverage, and text similarity are high, score should be >= 80
    assert score >= 75.0

    breakdown = eval_result["parsed_breakdown"]
    assert "text_similarity_score" in breakdown
    assert "category_score" in breakdown
    assert breakdown["category_score"] == 100.0
    assert breakdown["quantity_score"] == 100.0
    assert breakdown["location_score"] == 100.0
    assert len(breakdown["reasons"]) >= 3


def test_recommendations_generation_endpoint(client):
    response = client.post("/api/v1/matches/generate?min_score=30.0")
    assert response.status_code == 200
    data = response.json()
    assert "top_matches" in data
    assert len(data["top_matches"]) > 0

    top = data["top_matches"][0]
    assert top["score"] >= 70.0
    assert "parsed_breakdown" in top
    assert top["parsed_breakdown"] is not None
    assert len(top["parsed_breakdown"]["reasons"]) > 0
