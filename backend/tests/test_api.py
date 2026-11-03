import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.database import init_db, SessionLocal
from app.validation import run_intelligent_validation
from app.models import sql_models

# Ensure database tables and initial seed data are initialized
init_db()

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == "backend-api"
    assert "components" in data

def test_dashboard_stats():
    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_records" in data
    assert "verified_records" in data
    assert "pending_records" in data
    assert "rejected_records" in data
    assert data["total_records"] >= 0

def test_login_valid_credentials():
    payload = {
        "email": "admin@landrecords.gov.in",
        "password": "admin123"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["role"] == "admin"

def test_login_invalid_credentials():
    payload = {
        "email": "admin@landrecords.gov.in",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", json=payload)
    assert response.status_code == 401

def test_validation_rule_negative_area():
    db = SessionLocal()
    try:
        mock_record = sql_models.LandRecord(
            owner_name="Test Owner",
            survey_number="12/3",
            ulpin="TEST-ULPIN-001",
            district="Bengaluru Urban",
            taluk="North",
            village="Hebbal",
            land_area=-5.0, # Negative area
            land_unit="Acres",
            document_number="DOC-2024-REG-1111",
            status="Pending"
        )
        report = run_intelligent_validation(mock_record, db)
        assert report["status"] == "Rejected"
        assert any("negative" in err.lower() for err in report["errors"])
    finally:
        db.close()

def test_validation_rule_missing_owner():
    db = SessionLocal()
    try:
        mock_record = sql_models.LandRecord(
            owner_name="", # Empty owner
            survey_number="12/3",
            ulpin="TEST-ULPIN-002",
            district="Bengaluru Urban",
            taluk="North",
            village="Hebbal",
            land_area=2.5,
            land_unit="Acres",
            document_number="DOC-2024-REG-1112",
            status="Pending"
        )
        report = run_intelligent_validation(mock_record, db)
        assert report["status"] == "Rejected"
        assert any("owner name is missing" in err.lower() for err in report["errors"])
    finally:
        db.close()
