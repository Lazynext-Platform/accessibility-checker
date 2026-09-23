# File: app/routes/analytics.py
from fastapi import APIRouter, Depends
from app.services.analytics import track_event
from app.schemas.analytics import AnalyticsEvent
from app.repositories.analytics import get_db

router = APIRouter()

@router.post("/track")
async def track_event_endpoint(event: AnalyticsEvent):
    return track_event(event)

@router.get("/analytics")
async def get_analytics_endpoint(db: Session = Depends(get_db)):
    return get_analytics(db)