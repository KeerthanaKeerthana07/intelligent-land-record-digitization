from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import sql_models, schemas
from app.validation import run_intelligent_validation

router = APIRouter(prefix="/api/validation", tags=["Validation"])

@router.get("/{record_id}", response_model=schemas.ValidationReportResponse)
def get_validation_report(record_id: int, db: Session = Depends(get_db)):
    val_res = db.query(sql_models.ValidationResult).filter(sql_models.ValidationResult.record_id == record_id).first()
    if not val_res:
        # If not already present, run on the fly
        rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
        if not rec:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Land Record #{record_id} not found")
        
        ocr_data = None
        if rec.documents and rec.documents[0].ocr_extracted_data:
            ocr_data = rec.documents[0].extracted_data

        report = run_intelligent_validation(rec, db, ocr_data)
        val_res = sql_models.ValidationResult(
            record_id=rec.id,
            status=report["status"],
            error_count=report["error_count"],
            warning_count=report["warning_count"],
            errors_json=report["errors"],
            warnings_json=report["warnings"],
            suggestions_json=report["suggestions"],
            rules_evaluated_json=report["rules_evaluated"]
        )
        db.add(val_res)
        db.commit()
        db.refresh(val_res)

    return {
        "id": val_res.id,
        "record_id": val_res.record_id,
        "status": val_res.status,
        "error_count": val_res.error_count,
        "warning_count": val_res.warning_count,
        "errors": val_res.errors,
        "warnings": val_res.warnings,
        "suggestions": val_res.suggestions,
        "rules_evaluated": val_res.rules_evaluated,
        "validated_at": val_res.validated_at,
        "disclaimer": "Rule-based technical verification for digitization prototyping."
    }

@router.post("/{record_id}", response_model=schemas.ValidationReportResponse)
def revalidate_record(record_id: int, db: Session = Depends(get_db)):
    rec = db.query(sql_models.LandRecord).filter(sql_models.LandRecord.id == record_id).first()
    if not rec:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Land Record #{record_id} not found")

    ocr_data = None
    if rec.documents and rec.documents[0].ocr_extracted_data:
        ocr_data = rec.documents[0].extracted_data

    report = run_intelligent_validation(rec, db, ocr_data)
    rec.status = report["status"]

    val_res = db.query(sql_models.ValidationResult).filter(sql_models.ValidationResult.record_id == record_id).first()
    if val_res:
        val_res.status = report["status"]
        val_res.error_count = report["error_count"]
        val_res.warning_count = report["warning_count"]
        val_res.errors_json = report["errors"]
        val_res.warnings_json = report["warnings"]
        val_res.suggestions_json = report["suggestions"]
        val_res.rules_evaluated_json = report["rules_evaluated"]
    else:
        val_res = sql_models.ValidationResult(
            record_id=rec.id,
            status=report["status"],
            error_count=report["error_count"],
            warning_count=report["warning_count"],
            errors_json=report["errors"],
            warnings_json=report["warnings"],
            suggestions_json=report["suggestions"],
            rules_evaluated_json=report["rules_evaluated"]
        )
        db.add(val_res)

    db.commit()
    db.refresh(val_res)

    return {
        "id": val_res.id,
        "record_id": val_res.record_id,
        "status": val_res.status,
        "error_count": val_res.error_count,
        "warning_count": val_res.warning_count,
        "errors": val_res.errors,
        "warnings": val_res.warnings,
        "suggestions": val_res.suggestions,
        "rules_evaluated": val_res.rules_evaluated,
        "validated_at": val_res.validated_at,
        "disclaimer": "Rule-based technical verification for digitization prototyping."
    }
