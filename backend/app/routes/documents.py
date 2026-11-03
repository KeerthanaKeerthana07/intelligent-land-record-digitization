import os
import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import sql_models, schemas
from app.services.ocr_client import call_ocr_service

router = APIRouter(prefix="/api/documents", tags=["Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

ALLOWED_EXTS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"}
MAX_FILE_SIZE = 15 * 1024 * 1024  # 15MB

@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    record_id: Optional[int] = Form(None),
    db: Session = Depends(get_db)
):
    # 1. Validate extension
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported document format '{ext}'. Allowed: {', '.join(ALLOWED_EXTS)}"
        )

    # 2. Read bytes
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read file.")

    if not content or len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File exceeds 15MB limit.")

    # 3. Save to disk
    unique_filename = f"{uuid.uuid4().hex}_{file.filename}"
    saved_path = os.path.join(UPLOAD_DIR, unique_filename)
    with open(saved_path, "wb") as f:
        f.write(content)

    # 4. Trigger OCR extraction
    ocr_result = await call_ocr_service(content, file.filename, file.content_type or "application/octet-stream")
    raw_ocr_text = ocr_result.get("raw_text", "")
    extracted_entities = ocr_result.get("extracted_entities", {})

    # 5. Persist document record in database
    doc_record = sql_models.UploadedDocument(
        record_id=record_id,
        file_name=unique_filename,
        original_file_name=file.filename,
        file_path=f"/uploads/{unique_filename}",
        file_type=ext,
        file_size=len(content),
        ocr_raw_text=raw_ocr_text,
        ocr_extracted_data=extracted_entities
    )
    db.add(doc_record)
    db.commit()
    db.refresh(doc_record)

    return {
        "success": True,
        "document_id": doc_record.id,
        "record_id": doc_record.record_id,
        "file_name": doc_record.file_name,
        "original_file_name": doc_record.original_file_name,
        "file_path": doc_record.file_path,
        "file_size": doc_record.file_size,
        "file_type": doc_record.file_type,
        "ocr_confidence": ocr_result.get("confidence_score", 90.0),
        "raw_text": raw_ocr_text,
        "extracted_entities": extracted_entities
    }

@router.get("/{document_id}")
def get_document(document_id: int, db: Session = Depends(get_db)):
    doc = db.query(sql_models.UploadedDocument).filter(sql_models.UploadedDocument.id == document_id).first()
    if not doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document #{document_id} not found")

    file_disk_path = os.path.join(UPLOAD_DIR, doc.file_name)
    if os.path.exists(file_disk_path):
        return FileResponse(
            path=file_disk_path,
            filename=doc.original_file_name,
            media_type="application/pdf" if doc.file_type == ".pdf" else f"image/{doc.file_type.replace('.', '')}"
        )
    
    # If physical file missing on disk (e.g. fresh ephemeral container), return metadata JSON
    return {
        "id": doc.id,
        "record_id": doc.record_id,
        "file_name": doc.file_name,
        "original_file_name": doc.original_file_name,
        "file_path": doc.file_path,
        "file_size": doc.file_size,
        "file_type": doc.file_type,
        "ocr_raw_text": doc.ocr_raw_text,
        "ocr_extracted_data": doc.extracted_data,
        "uploaded_at": doc.uploaded_at
    }
