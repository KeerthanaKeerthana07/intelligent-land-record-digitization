import json
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database import get_db
from app.models import sql_models, schemas
from app.validation import run_intelligent_validation
from app.services.auth_service import get_current_user

router = APIRouter(prefix="/api/records", tags=["Land Records"])

def format_record_response(rec: sql_models.LandRecord) -> dict:
    val_res = None
    if rec.validation_result:
        vr = rec.validation_result
        val_res = {
            "id": vr.id,
            "record_id": vr.record_id,
            "status": vr.status,
            "error_count": vr.error_count,
            "warning_count": vr.warning_count,
            "errors": vr.errors,
            "warnings": vr.warnings,
            "suggestions": vr.suggestions,
            "rules_evaluated": vr.rules_evaluated,
            "validated_at": vr.validated_at,
            "disclaimer": "Rule-based technical verification for digitization prototyping."
        }

    docs = []
    for d in rec.documents:
        docs.append({
            "id": d.id,
            "record_id": d.record_id,
            "file_name": d.file_name,
            "original_file_name": d.original_file_name,
            "file_path": d.file_path,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "ocr_raw_text": d.ocr_raw_text,
            "ocr_extracted_data": d.extracted_data,
            "uploaded_at": d.uploaded_at
        })

    return {
        "id": rec.id,
        "owner_name": rec.owner_name,
        "survey_number": rec.survey_number,
        "ulpin": rec.ulpin,
        "district": rec.district,
        "taluk": rec.taluk,
        "village": rec.village,
        "land_area": rec.land_area,
        "land_unit": rec.land_unit,
        "land_type": rec.land_type,
        "document_number": rec.document_number,
        "status": rec.status,
        "notes": rec.notes,
        "created_at": rec.created_at,
        "updated_at": rec.updated_at,
        "created_by_id": rec.created_by_id,
        "validation_result": val_res,
        "documents": docs
    }

@router.get("", response_model=schemas.LandRecordListResponse)
def get_records(
    search: Optional[str] = Query(None, description="Search by owner, survey number, ULPIN, village"),
    status: Optional[str] = Query(None, description="Filter by status: Verified, Pending, Rejected"),
    district: Optional[str] = Query(None, description="Filter by district"),
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    sort_by: str = Query("created_at", description="Field to sort by: created_at, owner_name, land_area"),
    order: str = Query("desc", description="Sort order: asc or desc"),
    db: Session = Depends(get_db)
):
    query = db.query(sql_models.LandRecord)

    # 1. Search Filter
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                sql_models.LandRecord.owner_name.ilike(term),
                sql_models.LandRecord.survey_number.ilike(term),
                sql_models.LandRecord.ulpin.ilike(term),
                sql_models.LandRecord.village.ilike(term),
                sql_models.LandRecord.document_number.ilike(term)
            )
        )

    # 2. Status Filter
    if status and status.lower() != "all":
        query = query.filter(sql_models.LandRecord.status.ilike(status))

    # 3. District Filter
    if district and district.lower() != "all":
        query = query.filter(sql_models.LandRecord.district.ilike(f"%{district}%"))

    # 4. Total Count
    total = query.count()

    # 5. Sorting
    sort_column = getattr(sql_models.LandRecord, sort_by, sql_models.LandRecord.created_at)
    if order.lower() == "asc":
        query = query.order_by(asc(sort_column))
    else:
        query = query.order_by(desc(sort_column))

    # 6. Pagination
    records = query.offset((page - 1) * limit).limit(limit).all()

    formatted_records = [format_record_response(r) for r in records]

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "records": formatted_records
    }

@router.get("/{record_id}", response_model=schemas.LandRecordResponse)
def get_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Land record #{record_id} not found")
    return format_record_response(rec)

@router.post("", response_model=schemas.LandRecordResponse, status_code=status.HTTP_201_CREATED)
def create_record(
    record_in: schemas.LandRecordCreate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    # Check ULPIN uniqueness
    existing_ulpin = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.ulpin == record_in.ulpin).first()
    if existing_ulpin:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"A land record with ULPIN '{record_in.ulpin}' already exists (Record #{existing_ulpin.id})."
        )

    user_id = current_user.id if current_user else None
    user_email = current_user.email if current_user else "system@landrecords.gov.in"

    # Create new record object
    new_record = sql_models.LandRecord(
        owner_name=record_in.owner_name.strip(),
        survey_number=record_in.survey_number.strip(),
        ulpin=record_in.ulpin.strip(),
        district=record_in.district.strip(),
        taluk=record_in.taluk.strip(),
        village=record_in.village.strip(),
        land_area=record_in.land_area,
        land_unit=record_in.land_unit,
        land_type=record_in.land_type,
        document_number=record_in.document_number.strip(),
        status="Pending",
        notes=record_in.notes,
        created_by_id=user_id
    )
    db.add(new_record)
    db.flush()  # assign ID

    # Link uploaded document if document_id provided
    ocr_data = None
    if record_in.document_id:
        doc = db.query(sql_models.UploadedDocument).filter(sql_models.UploadedDocument.id == record_in.document_id).first()
        if doc:
            doc.record_id = new_record.id
            if doc.ocr_extracted_data:
                ocr_data = doc.extracted_data

    # Run intelligent validation
    val_report = run_intelligent_validation(new_record, db, ocr_data)
    new_record.status = val_report["status"]

    val_res = sql_models.ValidationResult(
        record_id=new_record.id,
        status=val_report["status"],
        error_count=val_report["error_count"],
        warning_count=val_report["warning_count"],
        errors_json=val_report["errors"],
        warnings_json=val_report["warnings"],
        suggestions_json=val_report["suggestions"],
        rules_evaluated_json=val_report["rules_evaluated"]
    )
    db.add(val_res)

    # Log activity
    log = sql_models.ActivityLog(
        user_email=user_email,
        action="RECORD_CREATED",
        details=f"Created Record #{new_record.id} for '{new_record.owner_name}' (Status: {new_record.status}).",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()
    db.refresh(new_record)

    return format_record_response(new_record)

@router.put("/{record_id}", response_model=schemas.LandRecordResponse)
def update_record(
    record_id: int,
    record_in: schemas.LandRecordUpdate,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Record #{record_id} not found")

    update_data = record_in.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(rec, field, val)

    # Fetch associated OCR data if available
    ocr_data = None
    if rec.documents:
        first_doc = rec.documents[0]
        if first_doc.ocr_extracted_data:
            ocr_data = first_doc.extracted_data

    # Re-run intelligent validation if status was not manually overridden
    if "status" not in update_data:
        val_report = run_intelligent_validation(rec, db, ocr_data)
        rec.status = val_report["status"]
        if rec.validation_result:
            rec.validation_result.status = val_report["status"]
            rec.validation_result.error_count = val_report["error_count"]
            rec.validation_result.warning_count = val_report["warning_count"]
            rec.validation_result.errors_json = val_report["errors"]
            rec.validation_result.warnings_json = val_report["warnings"]
            rec.validation_result.suggestions_json = val_report["suggestions"]
            rec.validation_result.rules_evaluated_json = val_report["rules_evaluated"]
        else:
            val_res = sql_models.ValidationResult(
                record_id=rec.id,
                status=val_report["status"],
                error_count=val_report["error_count"],
                warning_count=val_report["warning_count"],
                errors_json=val_report["errors"],
                warnings_json=val_report["warnings"],
                suggestions_json=val_report["suggestions"],
                rules_evaluated_json=val_report["rules_evaluated"]
            )
            db.add(val_res)

    user_email = current_user.email if current_user else "system@landrecords.gov.in"
    log = sql_models.ActivityLog(
        user_email=user_email,
        action="RECORD_UPDATED",
        details=f"Updated details for Record #{rec.id} (Owner: {rec.owner_name}).",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()
    db.refresh(rec)

    return format_record_response(rec)

@router.delete("/{record_id}")
def delete_record(
    record_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[sql_models.User] = Depends(get_current_user)
):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Record #{record_id} not found")

    user_email = current_user.email if current_user else "admin@landrecords.gov.in"
    owner = rec.owner_name

    db.delete(rec)

    log = sql_models.ActivityLog(
        user_email=user_email,
        action="RECORD_DELETED",
        details=f"Deleted Land Record #{record_id} belonging to '{owner}'.",
        ip_address=request.client.host if request.client else "127.0.0.1"
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Land Record #{record_id} deleted successfully."}
