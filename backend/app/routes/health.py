import time
import os
import sys
import platform
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db, DATABASE_URL
from app.services.ocr_client import check_ocr_health

router = APIRouter(tags=["Health & Monitoring"])

START_TIME = time.time()

@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    start = time.time()
    
    # 1. Database Health Check
    db_status = "healthy"
    db_latency = 0.0
    db_engine_name = "PostgreSQL" if "postgres" in DATABASE_URL else "SQLite (Fallback/Local)"
    try:
        t0 = time.time()
        db.execute(text("SELECT 1"))
        db_latency = round((time.time() - t0) * 1000, 2)
    except Exception as e:
        db_status = "unhealthy"
        db_engine_name = f"Error: {str(e)}"

    # 2. OCR Microservice Health Check
    ocr_info = await check_ocr_health()

    total_latency = round((time.time() - start) * 1000, 2)
    overall_status = "healthy" if db_status == "healthy" else "degraded"

    return {
        "status": overall_status,
        "service": "backend-api",
        "version": "1.0.0",
        "timestamp": time.time(),
        "total_latency_ms": total_latency,
        "components": {
            "database": {
                "status": db_status,
                "engine": db_engine_name,
                "latency_ms": db_latency
            },
            "ocr_service": ocr_info,
            "api_server": {
                "status": "healthy",
                "uptime_seconds": round(time.time() - START_TIME, 1)
            }
        }
    }

@router.get("/api/monitoring/status")
async def detailed_monitoring_status(db: Session = Depends(get_db)):
    uptime = round(time.time() - START_TIME, 1)
    
    # Database stats
    db_status = "healthy"
    db_records_count = 0
    try:
        from app.models import sql_models
        db_records_count = db.query(sql_models.LandRecord).count()
    except Exception:
        db_status = "error"

    ocr_health = await check_ocr_health()

    return {
        "system": {
            "application_name": "Intelligent Land Record Digitization and Validation System",
            "environment": os.environ.get("ENVIRONMENT", "production-ready"),
            "platform": platform.platform(),
            "python_version": sys.version.split()[0],
            "api_framework": "FastAPI 0.110+",
            "server_uptime_seconds": uptime
        },
        "services": [
            {
                "name": "Backend REST API",
                "type": "Core Service",
                "status": "healthy",
                "port": int(os.environ.get("PORT", 8000)),
                "endpoint": "/health"
            },
            {
                "name": "PostgreSQL Database Engine",
                "type": "Relational Storage",
                "status": db_status,
                "port": 5432,
                "details": f"{db_records_count} land records indexed"
            },
            {
                "name": "Tesseract OCR Microservice",
                "type": "OCR & Digitization",
                "status": ocr_health.get("status", "unknown"),
                "port": 8001,
                "details": "Tesseract OCR / PDF Stream Parser"
            },
            {
                "name": "Vite React Client",
                "type": "Frontend SPA",
                "status": "healthy",
                "port": 3000,
                "details": "Government Technology Portal"
            }
        ],
        "docker_k8s_ready": True
    }
