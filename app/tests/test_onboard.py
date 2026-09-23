# File: app/tests/test_onboard.py

from fastapi.testclient import TestClient
from app.main import app
from app.db import get_db
from app.models import User

client = TestClient(app)

def test_onboard_user():
    # Test successful onboarding
    onboard_request = {
        "name": "Test User",
        "email": "test@example.com",
        "password": "password123"
    }
    response = client.post("/api/onboard", json=onboard_request)
    assert response.status_code == 200
    assert response.json()["email"] == onboard_request["email"]
    
    # Test duplicate user
    response = client.post("/api/onboard", json=onboard_request)
    assert response.status_code == 400
    assert response.json()["detail"] == "User already exists"
    
    # Test invalid request
    invalid_request = {
        "name": "Test User",
        "email": "invalid_email",
        "password": "password123"
    }
    response = client.post("/api/onboard", json=invalid_request)
    assert response.status_code == 500
    assert "invalid email" in response.json()["detail"].lower()