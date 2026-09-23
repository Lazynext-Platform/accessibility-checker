# File: app/schemas/analytics.py
from pydantic import BaseModel
from datetime import datetime

class AnalyticsEvent(BaseModel):
    event_type: str
    user_id: int
    revenue: float

    class Config:
        orm_mode = True

class AnalyticsResponse(BaseModel):
    id: int
    event_type: str
    user_id: int
    revenue: float
    created_at: datetime

    class Config:
        orm_mode = True