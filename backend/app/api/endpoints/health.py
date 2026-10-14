from fastapi import APIRouter
from app.core.config import settings

router = APIRouter()

@router.get("/health", summary="Service Health Check")
def health_check():
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "tagline": settings.PROJECT_TAGLINE,
        "version": settings.VERSION,
        "demo_mode": settings.DEMO_MODE,
    }
