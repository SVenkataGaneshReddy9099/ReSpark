from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List, Dict, Any
from datetime import datetime
from app.models.enums import MatchStatus
from app.schemas.resource import ResourceResponse
from app.schemas.need import NeedResponse

class ScoreBreakdown(BaseModel):
    text_similarity_score: float = Field(..., description="Cosine similarity score (0-100)")
    category_score: float = Field(..., description="Category compatibility (0-100)")
    quantity_score: float = Field(..., description="Quantity satisfaction (0-100)")
    location_score: float = Field(..., description="Location proximity (0-100)")
    urgency_score: float = Field(..., description="Urgency bonus (0-100)")
    weights: Dict[str, float]
    reasons: List[str]

class MatchBase(BaseModel):
    resource_id: int
    need_id: int
    score: float
    match_explanation: str
    proposed_quantity: float = 1.0
    status: MatchStatus = MatchStatus.SUGGESTED
    notes: Optional[str] = None

class MatchActionRequest(BaseModel):
    status: MatchStatus
    notes: Optional[str] = None
    allocated_quantity: Optional[float] = Field(None, gt=0)

class MatchResponse(BaseModel):
    id: int
    resource_id: int
    need_id: int
    score: float
    status: MatchStatus
    match_explanation: str
    proposed_quantity: float
    notes: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    resource: Optional[ResourceResponse] = None
    need: Optional[NeedResponse] = None
    parsed_breakdown: Optional[ScoreBreakdown] = None

    model_config = ConfigDict(from_attributes=True)

class GenerateMatchesResponse(BaseModel):
    total_candidates_evaluated: int
    new_matches_created: int
    existing_matches_updated: int
    top_matches: List[MatchResponse]
