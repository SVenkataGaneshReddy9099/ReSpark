from fastapi import APIRouter
from app.api.endpoints import health, resources, needs, matches, stats, users

api_router = APIRouter()

api_router.include_router(health.router, tags=["Health"])
api_router.include_router(resources.router, prefix="/resources", tags=["Resources"])
api_router.include_router(needs.router, prefix="/needs", tags=["Needs"])
api_router.include_router(matches.router, prefix="/matches", tags=["Matches"])
api_router.include_router(stats.router, prefix="/stats", tags=["Statistics & Impact"])
api_router.include_router(users.router, prefix="/users", tags=["Users"])
