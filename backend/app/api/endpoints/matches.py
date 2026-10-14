import json
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.session import get_db
from app.models.match import Match
from app.models.enums import MatchStatus
from app.schemas.match import (
    MatchResponse,
    MatchActionRequest,
    GenerateMatchesResponse,
    ScoreBreakdown,
)
from app.services.matching_engine import generate_recommendations
from app.services.match_service import transition_match_status

router = APIRouter()


def _enrich_match_response(match: Match) -> MatchResponse:
    """Helper to deserialize stored JSON match explanation into structured object."""
    parsed = None
    if match.match_explanation:
        try:
            data = json.loads(match.match_explanation)
            parsed = ScoreBreakdown(**data)
        except Exception:
            parsed = None

    resp = MatchResponse.model_validate(match)
    resp.parsed_breakdown = parsed
    return resp


@router.get("", response_model=List[MatchResponse], summary="List and filter matches")
def list_matches(
    status_filter: Optional[MatchStatus] = Query(None, alias="status", description="Filter by status"),
    resource_id: Optional[int] = Query(None, description="Filter by resource ID"),
    need_id: Optional[int] = Query(None, description="Filter by need ID"),
    min_score: Optional[float] = Query(None, description="Minimum score threshold"),
    db: Session = Depends(get_db),
):
    query = db.query(Match)

    if status_filter:
        query = query.filter(Match.status == status_filter)
    if resource_id:
        query = query.filter(Match.resource_id == resource_id)
    if need_id:
        query = query.filter(Match.need_id == need_id)
    if min_score is not None:
        query = query.filter(Match.score >= min_score)

    matches = query.order_by(Match.score.desc()).all()
    return [_enrich_match_response(m) for m in matches]


@router.post("/generate", response_model=GenerateMatchesResponse, summary="Trigger AI recommendation engine")
def trigger_generate_matches(
    min_score: float = Query(30.0, description="Minimum score threshold (0-100)"),
    db: Session = Depends(get_db),
):
    """
    Runs the 5-stage explainable AI matching engine on all active resources and open needs.
    Returns ranked recommendations and updates the recommendations catalog.
    """
    initial_count = db.query(Match).count()
    recommendations = generate_recommendations(db, min_score=min_score)
    final_count = db.query(Match).count()

    enriched_top = [_enrich_match_response(m) for m in recommendations[:20]]

    return GenerateMatchesResponse(
        total_candidates_evaluated=len(recommendations),
        new_matches_created=max(0, final_count - initial_count),
        existing_matches_updated=len(recommendations) - max(0, final_count - initial_count),
        top_matches=enriched_top,
    )


@router.get("/{match_id}", response_model=MatchResponse, summary="Get single match details")
def get_match(
    match_id: int,
    db: Session = Depends(get_db),
):
    match = db.query(Match).filter(Match.id == match_id).first()
    if not match:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Match with ID {match_id} not found."
        )
    return _enrich_match_response(match)


@router.post("/{match_id}/action", response_model=MatchResponse, summary="Transition match state")
def perform_match_action(
    match_id: int,
    action: MatchActionRequest,
    db: Session = Depends(get_db),
):
    """
    Performs transactional status transition (express interest, accept, complete, reject, cancel),
    adjusting allocated inventory and preventing over-allocation.
    """
    updated_match = transition_match_status(
        db=db,
        match_id=match_id,
        new_status=action.status,
        notes=action.notes,
        allocated_quantity=action.allocated_quantity,
    )
    return _enrich_match_response(updated_match)
