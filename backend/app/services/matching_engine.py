"""AI-Assisted Explainable Matching Engine for ReSpark.

This engine implements a transparent 5-stage matching pipeline:
1. Hard constraint candidate filtering
2. TF-IDF vectorization and cosine text similarity
3. Weighted multi-factor compatibility scoring (0-100)
4. Explainable natural language evidence generation
5. Reliability, null-safety, and quantity allocation bounds
"""

import json
import re
from typing import List, Dict, Any, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.resource import Resource
from app.models.need import Need
from app.models.match import Match
from app.models.enums import AvailabilityStatus, NeedStatus, MatchStatus, Category, ResourceType, Urgency

# Scoring weights (sum to 1.0)
WEIGHT_TEXT_SIMILARITY = 0.35
WEIGHT_CATEGORY_TYPE = 0.25
WEIGHT_QUANTITY = 0.15
WEIGHT_LOCATION = 0.15
WEIGHT_URGENCY = 0.10

# Category compatibility matrix (for cross-compatible categories)
COMPATIBLE_CATEGORIES = {
    Category.SKILLS: [Category.SKILLS, Category.VOLUNTEER],
    Category.VOLUNTEER: [Category.VOLUNTEER, Category.SKILLS],
    Category.TEXTBOOKS: [Category.TEXTBOOKS, Category.STATIONERY],
    Category.STATIONERY: [Category.STATIONERY, Category.TEXTBOOKS],
    Category.ELECTRONICS: [Category.ELECTRONICS],
    Category.FURNITURE: [Category.FURNITURE],
    Category.OTHER: [Category.OTHER],
}

# Cross-type compatibility
COMPATIBLE_RESOURCE_TYPES = {
    ResourceType.SKILL: [ResourceType.SKILL, ResourceType.SERVICE, ResourceType.VOLUNTEER_TIME],
    ResourceType.SERVICE: [ResourceType.SERVICE, ResourceType.SKILL, ResourceType.VOLUNTEER_TIME],
    ResourceType.VOLUNTEER_TIME: [ResourceType.VOLUNTEER_TIME, ResourceType.SKILL, ResourceType.SERVICE],
    ResourceType.PHYSICAL_ITEM: [ResourceType.PHYSICAL_ITEM],
}


def _clean_text(text: Optional[str]) -> str:
    """Sanitize and normalize text input."""
    if not text:
        return ""
    # Lowercase and strip punctuation
    text = text.lower().strip()
    text = re.sub(r"[^\w\s]", " ", text)
    return " ".join(text.split())


def _compute_tfidf_similarity(doc1: str, doc2: str) -> float:
    """Compute cosine similarity using TF-IDF via scikit-learn with fallback."""
    if not doc1.strip() or not doc2.strip():
        return 0.0

    try:
        from sklearn.feature_extraction.text import TfidfVectorizer
        from sklearn.metrics.pairwise import cosine_similarity

        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=(1, 2))
        tfidf_matrix = vectorizer.fit_transform([doc1, doc2])
        sim = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
        return float(max(0.0, min(1.0, sim)))
    except Exception:
        # Fallback: Token Jaccard overlap
        tokens1 = set(doc1.split())
        tokens2 = set(doc2.split())
        if not tokens1 or not tokens2:
            return 0.0
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        return float(len(intersection) / len(union)) if union else 0.0


def _location_similarity(loc1: str, loc2: str, is_virtual_compatible: bool = False) -> Tuple[float, str]:
    """Calculate location compatibility score and reasoning."""
    l1 = (loc1 or "").lower().strip()
    l2 = (loc2 or "").lower().strip()

    if not l1 or not l2:
        return 0.5, "Location unspecified; assumed moderate community proximity."

    # Virtual/remote options
    virtual_terms = {"remote", "online", "virtual", "any", "zoom", "anywhere"}
    if any(v in l1 for v in virtual_terms) or any(v in l2 for v in virtual_terms):
        return 0.95, "Remote or online participation is supported."

    # Exact match
    if l1 == l2:
        return 1.0, f"Same neighborhood or community area: '{loc1}'."

    # Partial match (e.g. 'Downtown Campus' and 'Downtown')
    if l1 in l2 or l2 in l1:
        return 0.85, f"Nearby community areas ('{loc1}' and '{loc2}')."

    # Common city or campus tokens
    tokens1 = set(l1.split())
    tokens2 = set(l2.split())
    overlap = tokens1.intersection(tokens2)
    if overlap:
        return 0.70, f"Shared geographic reference: {', '.join(overlap)}."

    if is_virtual_compatible:
        return 0.60, f"Different locations ('{loc1}' vs '{loc2}'), but skill/service can often be coordinated remotely."

    return 0.30, f"Different locations ('{loc1}' and '{loc2}'). Pickup or transport may be needed."


def evaluate_match_candidate(resource: Resource, need: Need) -> Optional[Dict[str, Any]]:
    """
    Evaluates a resource-need pair through the multi-stage matching engine.
    Returns None if hard constraints fail, or a detailed evaluation dict with score and explanations.
    """
    # -------------------------------------------------------------
    # STAGE 1: HARD CONSTRAINT FILTERING
    # -------------------------------------------------------------
    # 1. Availability & Status
    if resource.availability_status != AvailabilityStatus.AVAILABLE:
        return None
    if need.status != NeedStatus.OPEN:
        return None

    # 2. Prevent self-matching (same user cannot supply their own request)
    if resource.provider_id == need.requester_id:
        return None

    # 3. Quantity check: both must have remaining positive quantity
    res_remaining = resource.remaining_quantity
    need_remaining = need.remaining_requested
    if res_remaining <= 0 or need_remaining <= 0:
        return None

    # 4. Resource Type Compatibility
    compatible_types = COMPATIBLE_RESOURCE_TYPES.get(resource.resource_type, [resource.resource_type])
    if need.resource_type not in compatible_types:
        return None

    # 5. Category Compatibility
    compatible_cats = COMPATIBLE_CATEGORIES.get(resource.category, [resource.category])
    if need.category not in compatible_cats:
        return None

    # -------------------------------------------------------------
    # STAGE 2: TEXT SIMILARITY (TF-IDF + COSINE)
    # -------------------------------------------------------------
    # Title is weighted double compared to description
    res_text = f"{resource.title} {resource.title} {resource.description}"
    need_text = f"{need.title} {need.title} {need.description} {need.preferences or ''}"

    clean_res = _clean_text(res_text)
    clean_need = _clean_text(need_text)
    text_sim = _compute_tfidf_similarity(clean_res, clean_need)

    # -------------------------------------------------------------
    # STAGE 3: MULTI-FACTOR COMPATIBILITY SCORING
    # -------------------------------------------------------------
    reasons = []

    # Factor A: Text Similarity Score (0-100)
    text_score = text_sim * 100.0
    if text_sim >= 0.5:
        reasons.append(f"Strong semantic alignment ({int(text_score)}% similarity) between resource offering and requested need.")
    elif text_sim >= 0.2:
        reasons.append(f"Moderate keyword overlap ({int(text_score)}% similarity) in item details.")
    else:
        reasons.append("Basic listing title & description match within the same domain.")

    # Factor B: Category & Type Score (0-100)
    if resource.category == need.category and resource.resource_type == need.resource_type:
        category_score = 100.0
        reasons.append(f"Exact category match: both are '{resource.category.value.title()}' ({resource.resource_type.value.replace('_', ' ')}).")
    elif resource.category == need.category:
        category_score = 85.0
        reasons.append(f"Matching category '{resource.category.value.title()}', with complementary resource formats.")
    else:
        category_score = 65.0
        reasons.append(f"Cross-compatible categories ('{resource.category.value.title()}' with '{need.category.value.title()}').")

    # Factor C: Quantity Compatibility (0-100)
    proposed_qty = min(res_remaining, need_remaining)
    if res_remaining >= need_remaining:
        quantity_score = 100.0
        reasons.append(f"Full quantity coverage: available {res_remaining:g} {resource.unit} completely covers requested {need_remaining:g} {need.unit}.")
    else:
        quantity_score = (res_remaining / need_remaining) * 100.0
        reasons.append(f"Partial quantity fulfillment: provides {res_remaining:g} of {need_remaining:g} requested {need.unit} ({int(quantity_score)}% of need).")

    # Factor D: Location Compatibility (0-100)
    is_skill_or_volunteer = resource.resource_type in [ResourceType.SKILL, ResourceType.SERVICE, ResourceType.VOLUNTEER_TIME]
    loc_factor, loc_reason = _location_similarity(resource.location, need.location, is_virtual_compatible=is_skill_or_volunteer)
    location_score = loc_factor * 100.0
    reasons.append(loc_reason)

    # Factor E: Urgency & Readiness (0-100)
    urgency_map = {
        Urgency.CRITICAL: 100.0,
        Urgency.HIGH: 85.0,
        Urgency.MEDIUM: 65.0,
        Urgency.LOW: 50.0,
    }
    urgency_score = urgency_map.get(need.urgency, 60.0)
    if need.urgency in [Urgency.CRITICAL, Urgency.HIGH]:
        reasons.append(f"Priority boost: Need is marked '{need.urgency.value.upper()}' urgency and resource is immediately available.")

    # -------------------------------------------------------------
    # STAGE 4: COMPOSITE WEIGHTED SCORE NORMALIZATION
    # -------------------------------------------------------------
    total_score = (
        (text_score * WEIGHT_TEXT_SIMILARITY) +
        (category_score * WEIGHT_CATEGORY_TYPE) +
        (quantity_score * WEIGHT_QUANTITY) +
        (location_score * WEIGHT_LOCATION) +
        (urgency_score * WEIGHT_URGENCY)
    )

    # Clamp safely between 0.0 and 100.0
    final_score = round(max(0.0, min(100.0, total_score)), 1)

    breakdown = {
        "text_similarity_score": round(text_score, 1),
        "category_score": round(category_score, 1),
        "quantity_score": round(quantity_score, 1),
        "location_score": round(location_score, 1),
        "urgency_score": round(urgency_score, 1),
        "weights": {
            "text_similarity": WEIGHT_TEXT_SIMILARITY,
            "category": WEIGHT_CATEGORY_TYPE,
            "quantity": WEIGHT_QUANTITY,
            "location": WEIGHT_LOCATION,
            "urgency": WEIGHT_URGENCY,
        },
        "reasons": reasons,
    }

    return {
        "resource_id": resource.id,
        "need_id": need.id,
        "score": final_score,
        "proposed_quantity": proposed_qty,
        "match_explanation": json.dumps(breakdown),
        "parsed_breakdown": breakdown,
    }


def generate_recommendations(db: Session, min_score: float = 35.0) -> List[Match]:
    """
    Evaluates all active resources and open needs in the database.
    Idempotently creates or updates Match records, preventing duplicates and respecting state machines.
    Returns ranked list of top Match objects.
    """
    available_resources = db.query(Resource).filter(
        Resource.availability_status == AvailabilityStatus.AVAILABLE
    ).all()

    open_needs = db.query(Need).filter(
        Need.status == NeedStatus.OPEN
    ).all()

    evaluated_candidates = []

    for res in available_resources:
        if res.remaining_quantity <= 0:
            continue
        for nd in open_needs:
            if nd.remaining_requested <= 0:
                continue

            match_data = evaluate_match_candidate(res, nd)
            if not match_data:
                continue

            score = match_data["score"]
            if score < min_score:
                continue

            evaluated_candidates.append(match_data)

    # Sort evaluated candidates by score descending
    evaluated_candidates.sort(key=lambda x: x["score"], reverse=True)

    results = []

    for item in evaluated_candidates:
        existing_match = db.query(Match).filter(
            Match.resource_id == item["resource_id"],
            Match.need_id == item["need_id"],
        ).first()

        if existing_match:
            # If match is still in SUGGESTED status, update score and explanation
            if existing_match.status == MatchStatus.SUGGESTED:
                existing_match.score = item["score"]
                existing_match.match_explanation = item["match_explanation"]
                existing_match.proposed_quantity = item["proposed_quantity"]
                db.commit()
                db.refresh(existing_match)
            results.append(existing_match)
        else:
            # Create new suggested match
            new_match = Match(
                resource_id=item["resource_id"],
                need_id=item["need_id"],
                score=item["score"],
                status=MatchStatus.SUGGESTED,
                match_explanation=item["match_explanation"],
                proposed_quantity=item["proposed_quantity"],
            )
            db.add(new_match)
            db.commit()
            db.refresh(new_match)
            results.append(new_match)

    # Order results by score desc
    results.sort(key=lambda m: m.score, reverse=True)
    return results
