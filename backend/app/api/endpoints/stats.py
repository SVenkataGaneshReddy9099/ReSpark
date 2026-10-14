from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.stats import DashboardStats, ImpactStats
from app.services.stats_service import get_dashboard_statistics, get_community_impact

router = APIRouter()

@router.get("/dashboard", response_model=DashboardStats, summary="Get real-time dashboard metrics")
def get_dashboard_metrics(
    db: Session = Depends(get_db),
):
    stats = get_dashboard_statistics(db)
    return stats


@router.get("/impact", response_model=ImpactStats, summary="Get verified community & environmental impact")
def get_impact_metrics(
    db: Session = Depends(get_db),
):
    impact = get_community_impact(db)
    return impact
