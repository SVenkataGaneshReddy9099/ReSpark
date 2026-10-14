from pydantic import BaseModel
from typing import List, Dict, Any

class CategoryStat(BaseModel):
    category: str
    resource_count: int
    need_count: int
    completed_matches: int

class ActivityPoint(BaseModel):
    date: str
    resources_added: int
    needs_posted: int
    matches_completed: int

class MatchPipelineStat(BaseModel):
    status: str
    count: int

class DashboardStats(BaseModel):
    total_resources: int
    available_resources: int
    total_needs: int
    open_needs: int
    suggested_matches: int
    active_matches: int
    completed_matches: int
    resources_reused_count: int
    estimated_waste_avoided_kg: float
    waste_avoided_methodology: str
    category_breakdown: List[CategoryStat]
    match_pipeline: List[MatchPipelineStat]
    recent_activity: List[ActivityPoint]

class ImpactStats(BaseModel):
    total_completed_matches: int
    fulfilled_requests: int
    community_members_helped: int
    estimated_waste_avoided_kg: float
    estimated_co2_avoided_kg: float
    skills_hours_shared: float
    category_impact: List[Dict[str, Any]]
    methodology_assumptions: Dict[str, str]
