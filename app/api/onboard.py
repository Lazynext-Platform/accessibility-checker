# File: app/api/onboard.py

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from app.db import get_db
from app.auth import get_current_user
from app.models import User

router = APIRouter()

class OnboardRequest(BaseModel):
    """Request schema for user onboarding"""
    name: str
    email: str
    password: str

class OnboardResponse(BaseModel):
    """Response schema for user onboarding"""
    id: int
    name: str
    email: str

@router.post("/api/onboard", response_model=OnboardResponse)
async def onboard_user(
    onboard_request: OnboardRequest,
    db: AsyncSession = Depends(get_db),
    token: HTTPAuthorizationCredentials = Depends(HTTPBearer())
):
    """Streamline user onboarding process"""
    try:
        # Get current user from token
        current_user = get_current_user(token.credentials, db)
        
        # Check if user already exists
        existing_user = await User.get_by_email(db, onboard_request.email)
        if existing_user:
            raise HTTPException(status_code=400, detail="User already exists")
        
        # Create new user
        new_user = User(name=onboard_request.name, email=onboard_request.email)
        new_user.set_password(onboard_request.password)
        db.add(new_user)
        await db.commit()
        
        # Return onboarded user
        return OnboardResponse(id=new_user.id, name=new_user.name, email=new_user.email)
    
    except Exception as e:
        # Handle errors explicitly
        raise HTTPException(status_code=500, detail=str(e))