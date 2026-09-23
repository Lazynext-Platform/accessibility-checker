# File: app/models/analytics.py
from sqlalchemy import Column, Integer, String, DateTime, Float
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Analytics(Base):
    __tablename__ = 'analytics'

    id = Column(Integer, primary_key=True)
    event_type = Column(String)
    user_id = Column(Integer)
    revenue = Column(Float)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"Analytics(id={self.id}, event_type='{self.event_type}', user_id={self.user_id}, revenue={self.revenue}, created_at='{self.created_at}')"