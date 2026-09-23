# File: app/tests/test_analytics.py
from fastapi.testclient import TestClient
from app.main import app
from app.services.analytics import track_event
from app.schemas.analytics import AnalyticsEvent
from app.repositories.analytics import get_db

client = TestClient(app)

def test_track_event():
    event = AnalyticsEvent(event_type="user_signup", user_id=1, revenue=0.0)
    response = client.post("/track", json=event.dict())
    assert response.status_code == 200

def test_get_analytics():
    db = next(get_db())
    event = AnalyticsEvent(event_type="user_signup", user_id=1, revenue=0.0)
    track_event(event)
    response = client.get("/analytics")
    assert response.status_code == 200
    assert len(response.json()) > 0