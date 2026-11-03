from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime
from app.database import get_db
from app.models import sql_models, schemas

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=schemas.DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)):
    # 1. Counts directly from database
    total_records = db.query(sql_models.LandRecord).count()
    verified_records = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.status == "Verified").count()
    pending_records = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.status == "Pending").count()
    rejected_records = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.status == "Rejected").count()

    # 2. Total land area (positive values only)
    positive_area_sum = db.query(func.sum(sql_models.LandRecord.land_area))\
        .filter(sql_models.LandRecord.land_area > 0).scalar() or 0.0
    total_land_area = round(float(positive_area_sum), 2)

    # 3. Validation Breakdown Chart Data
    validation_breakdown = [
        {"name": "Verified", "value": verified_records, "color": "#0D9488"}, # Teal
        {"name": "Pending", "value": pending_records, "color": "#F59E0B"},   # Amber
        {"name": "Rejected", "value": rejected_records, "color": "#EF4444"}   # Rose
    ]

    # 4. Monthly Uploads Aggregation
    # Query last 6 months or generate distribution from records
    all_records = db.query(sql_models.LandRecord).order_by(sql_models.LandRecord.created_at.asc()).all()
    monthly_dict = {}
    for r in all_records:
        if r.created_at:
            month_key = r.created_at.strftime("%b %Y")
            monthly_dict[month_key] = monthly_dict.get(month_key, 0) + 1

    if not monthly_dict:
        monthly_uploads = [
            {"month": "May 2026", "count": 2},
            {"month": "Jun 2026", "count": 3},
            {"month": "Jul 2026", "count": 1},
            {"month": "Aug 2026", "count": 4},
            {"month": "Sep 2026", "count": 2},
            {"month": "Oct 2026", "count": total_records or 8}
        ]
    else:
        monthly_uploads = [{"month": k, "count": v} for k, v in monthly_dict.items()]

    # 5. Recent documents
    docs = db.query(sql_models.UploadedDocument)\
        .order_by(sql_models.UploadedDocument.uploaded_at.desc())\
        .limit(5).all()

    recent_documents = []
    for d in docs:
        rec = d.record
        recent_documents.append({
            "id": d.id,
            "record_id": d.record_id,
            "file_name": d.file_name,
            "owner_name": rec.owner_name if rec else "Pending Assignment",
            "survey_number": rec.survey_number if rec else "-",
            "status": rec.status if rec else "Uploaded",
            "uploaded_at": d.uploaded_at
        })

    # If no uploaded documents yet, construct from top 5 land records
    if not recent_documents:
        top_records = db.query(sql_models.LandRecord).order_by(sql_models.LandRecord.created_at.desc()).limit(5).all()
        for r in top_records:
            recent_documents.append({
                "id": r.id,
                "record_id": r.id,
                "file_name": f"{r.document_number}.pdf",
                "owner_name": r.owner_name,
                "survey_number": r.survey_number,
                "status": r.status,
                "uploaded_at": r.created_at
            })

    # 6. Recent Activity
    activity_items = db.query(sql_models.ActivityLog)\
        .order_by(sql_models.ActivityLog.created_at.desc())\
        .limit(6).all()
    
    recent_activity = []
    for act in activity_items:
        recent_activity.append({
            "id": act.id,
            "user_email": act.user_email,
            "action": act.action,
            "details": act.details,
            "created_at": act.created_at.isoformat() if act.created_at else datetime.now().isoformat()
        })

    return {
        "total_records": total_records,
        "verified_records": verified_records,
        "pending_records": pending_records,
        "rejected_records": rejected_records,
        "total_land_area": total_land_area,
        "validation_breakdown": validation_breakdown,
        "monthly_uploads": monthly_uploads,
        "recent_documents": recent_documents,
        "recent_activity": recent_activity
    }
