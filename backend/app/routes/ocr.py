from fastapi import APIRouter, UploadFile, File, HTTPException, status
from app.services.ocr_client import call_ocr_service

router = APIRouter(prefix="/api/ocr", tags=["OCR"])

@router.post("/extract")
async def extract_ocr_direct(file: UploadFile = File(...)):
    """
    Direct endpoint for scanning and extracting text from a land record document.
    Used for instant form autofill and human-in-the-loop review.
    """
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Failed to read file.")

    if not content or len(content) == 0:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")

    result = await call_ocr_service(
        file_bytes=content,
        filename=file.filename or "document.pdf",
        content_type=file.content_type or "application/octet-stream"
    )

    return result
