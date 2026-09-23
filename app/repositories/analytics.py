# File: app/repositories/analytics.py
from app.models.analytics import Analytics
from app.db import SessionLocal
from sqlalchemy.orm import Session
from typing import List

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_analytics(db: Session, analytics: Analytics):
    db.add(analytics)
    db.commit()
    db.refresh(analytics)
    return analytics

def get_analytics(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Analytics).offset(skip).limit(limit).all()