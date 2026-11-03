from fastapi import APIRouter, Depends, HTTPException, status, Request, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.database import get_db
from app.models import sql_models, schemas
from app.services.auth_service import hash_password, get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])

@router.get("/users", response_model=List[schemas.UserResponse])
def get_users(db: Session = Depends(get_db)):
    users = db.query(sql_models.User).order_by(sql_models.User.id.asc()).all()
    return users

@router.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_in: schemas.UserCreate, 
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    existing = db.query(sql_models.User).filter(sql_models.User.email == user_in.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{user_in.email}' already exists."
        )

    new_user = sql_models.User(
        email=user_in.email,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=user_in.role,
        department=user_in.department,
        is_active=user_in.is_active
    )
    db.add(new_user)
    
    # Audit log
    admin_email = current_user.email if current_user else "admin@landrecords.gov.in"
    log = sql_models.ActivityLog(
        user_email=admin_email,
        action="USER_CREATED",
        details=f"Admin created new officer user '{new_user.email}' ({new_user.full_name}).",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()
    db.refresh(new_user)

    return new_user

@router.get("/activity", response_model=List[schemas.ActivityLogResponse])
def get_activity_logs(
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    logs = db.query(sql_models.ActivityLog)\
        .order_by(sql_models.ActivityLog.created_at.desc())\
        .limit(limit).all()
    return logs

@router.put("/records/{record_id}/approve", response_model=schemas.LandRecordResponse)
def approve_record(
    record_id: int,
    request: Request,
    notes: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Land Record #{record_id} not found")

    rec.status = "Verified"
    if notes:
        rec.notes = f"{rec.notes or ''} [Admin Approval Note: {notes}]"

    # Also update validation result status
    if rec.validation_result:
        rec.validation_result.status = "Verified"

    admin_email = current_user.email if current_user else "admin@landrecords.gov.in"
    log = sql_models.ActivityLog(
        user_email=admin_email,
        action="ADMIN_APPROVAL",
        details=f"Admin manually approved Land Record #{record_id} for '{rec.owner_name}'.",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()
    db.refresh(rec)

    from app.routes.records import format_record_response
    return format_record_response(rec)

@router.put("/records/{record_id}/reject", response_model=schemas.LandRecordResponse)
def reject_record(
    record_id: int,
    request: Request,
    reason: Optional[str] = "Rejected by administrative order upon manual inspection.",
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Land Record #{record_id} not found")

    rec.status = "Rejected"
    rec.notes = f"{rec.notes or ''} [Rejection Reason: {reason}]"

    if rec.validation_result:
        rec.validation_result.status = "Rejected"

    admin_email = current_user.email if current_user else "admin@landrecords.gov.in"
    log = sql_models.ActivityLog(
        user_email=admin_email,
        action="ADMIN_REJECTION",
        details=f"Admin rejected Land Record #{record_id} for '{rec.owner_name}'. Reason: {reason}",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()
    db.refresh(rec)

    from app.routes.records import format_record_response
    return format_record_response(rec)
