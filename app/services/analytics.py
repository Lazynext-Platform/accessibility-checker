# File: app/services/analytics.py
from app.repositories.analytics import get_db, create_analytics
from app.schemas.analytics import AnalyticsEvent
from app.models.analytics import Analytics

def track_event(event: AnalyticsEvent):
    db = next(get_db())
    analytics = Analytics(event_type=event.event_type, user_id=event.user_id, revenue=event.revenue)
    return create_analytics(db, analytics)