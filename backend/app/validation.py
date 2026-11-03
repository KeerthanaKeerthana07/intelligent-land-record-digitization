import re
import json
import logging
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models import sql_models

logger = logging.getLogger("validation-engine")

def run_intelligent_validation(
    record: sql_models.LandRecord, 
    db: Session,
    ocr_data: Optional[Dict[str, Any]] = None
) -> Dict[str, Any]:
    """
    Intelligent Rule-Based Validation for Land Records.
    Evaluates:
      1. Missing owner name
      2. Missing survey number
      3. Duplicate survey number within the same district & village
      4. Invalid document number format
      5. Missing land area
      6. Invalid or negative land area
      7. Missing location information (District, Taluk, Village)
      8. Cross-check between manually entered fields and OCR-extracted values
    """
    errors: List[str] = []
    warnings: List[str] = []
    suggestions: List[str] = []
    rules_evaluated: List[Dict[str, Any]] = []

    # ---------------- Rule 1: Owner Name Check ----------------
    if not record.owner_name or not record.owner_name.strip():
        errors.append("Owner name is missing. A valid legal owner name is required.")
        suggestions.append("Enter the complete legal name as specified on the registered title deed.")
        rules_evaluated.append({
            "rule": "Owner Name Presence",
            "passed": False,
            "details": "Owner name field was blank or whitespace."
        })
    elif len(record.owner_name.strip()) < 3:
        errors.append(f"Owner name '{record.owner_name}' is too short (min 3 characters).")
        rules_evaluated.append({
            "rule": "Owner Name Presence",
            "passed": False,
            "details": f"Owner name length is only {len(record.owner_name.strip())} chars."
        })
    elif bool(re.search(r'[0-9!@#$%^&*()_+={}\[\]:;"\'<>,.?~`|\\]', record.owner_name)):
        warnings.append("Owner name contains special characters or numbers. Verify with original deed.")
        rules_evaluated.append({
            "rule": "Owner Name Presence",
            "passed": True,
            "note": "Special characters flagged for manual review."
        })
    else:
        rules_evaluated.append({
            "rule": "Owner Name Presence",
            "passed": True,
            "details": f"Valid owner: {record.owner_name}"
        })

    # ---------------- Rule 2: Survey Number Check ----------------
    if not record.survey_number or not record.survey_number.strip():
        errors.append("Survey number is missing.")
        suggestions.append("Provide a valid cadastral survey number (e.g., 142/3A, 88/1B).")
        rules_evaluated.append({
            "rule": "Survey Number Check",
            "passed": False,
            "details": "Survey number is blank."
        })
    elif not re.match(r'^[0-9]+([\/\-][0-9]+[A-Za-z]*)?$', record.survey_number.strip()):
        warnings.append(f"Survey number '{record.survey_number}' does not follow standard revenue format (e.g. 142/3A).")
        rules_evaluated.append({
            "rule": "Survey Number Check",
            "passed": True,
            "note": "Non-standard format permitted with supervisor review."
        })
    else:
        rules_evaluated.append({
            "rule": "Survey Number Check",
            "passed": True,
            "details": f"Survey number {record.survey_number} is standard."
        })

    # ---------------- Rule 3: Duplicate Survey Number Check ----------------
    if record.survey_number and record.district and record.village:
        duplicate_query = db.query(sql_models.LandRecord).filter(
            sql_models.LandRecord.survey_number == record.survey_number.strip(),
            sql_models.LandRecord.village.ilike(record.village.strip()),
            sql_models.LandRecord.district.ilike(record.district.strip())
        )
        if record.id:
            duplicate_query = duplicate_query.filter(sql_models.LandRecord.id != record.id)
        
        duplicate_record = duplicate_query.first()
        if duplicate_record:
            errors.append(
                f"Duplicate Survey Number '{record.survey_number}' detected in Village '{record.village}', District '{record.district}'. Already registered under Record #{duplicate_record.id} for '{duplicate_record.owner_name}'."
            )
            suggestions.append("Check if this parcel is an unrecorded sub-division (e.g., append sub-pot number -1) or resolve title overlap conflict.")
            rules_evaluated.append({
                "rule": "Duplicate Survey Check",
                "passed": False,
                "details": f"Conflict with existing Record #{duplicate_record.id}."
            })
        else:
            rules_evaluated.append({
                "rule": "Duplicate Survey Check",
                "passed": True,
                "details": "No duplicate survey conflicts detected in village database."
            })
    else:
        rules_evaluated.append({
            "rule": "Duplicate Survey Check",
            "passed": False,
            "details": "Skipped due to missing survey or village data."
        })

    # ---------------- Rule 4: Document Number Format Check ----------------
    if not record.document_number or not record.document_number.strip():
        errors.append("Document registration number is required.")
        suggestions.append("Enter the registration deed number (e.g., DOC-2024-REG-7819).")
        rules_evaluated.append({
            "rule": "Document Number Check",
            "passed": False,
            "details": "Document number is blank."
        })
    elif record.document_number.startswith("INV-") or len(record.document_number.strip()) < 5:
        errors.append(f"Invalid document number format '{record.document_number}'. Expected official registry format.")
        suggestions.append("Use standard registrar format (e.g., DOC-YYYY-REG-XXXX or sub-registrar book volume).")
        rules_evaluated.append({
            "rule": "Document Number Check",
            "passed": False,
            "details": f"Document number '{record.document_number}' rejected."
        })
    else:
        rules_evaluated.append({
            "rule": "Document Number Check",
            "passed": True,
            "details": f"Document number {record.document_number} format accepted."
        })

    # ---------------- Rule 5 & 6: Land Area Check (Missing / Negative / Unreal) ----------------
    if record.land_area is None:
        errors.append("Land area is missing.")
        suggestions.append("Enter land parcel area in Acres, Hectares, or Guntas.")
        rules_evaluated.append({
            "rule": "Land Area Positive Check",
            "passed": False,
            "details": "Land area value is null."
        })
    elif record.land_area <= 0:
        errors.append(f"Invalid or negative land area ({record.land_area} {record.land_unit}). Area must be strictly greater than zero.")
        suggestions.append("Enter positive decimal land area value (e.g., 2.50).")
        rules_evaluated.append({
            "rule": "Land Area Positive Check",
            "passed": False,
            "details": f"Land area {record.land_area} <= 0."
        })
    elif record.land_area > 5000:
        warnings.append(f"Land area of {record.land_area} {record.land_unit} exceeds normal threshold (5,000). Verify if parcel is a state forest or tea estate.")
        rules_evaluated.append({
            "rule": "Land Area Positive Check",
            "passed": True,
            "note": "Unusually large parcel flagged for senior director review."
        })
    else:
        rules_evaluated.append({
            "rule": "Land Area Positive Check",
            "passed": True,
            "details": f"Valid positive area: {record.land_area} {record.land_unit}"
        })

    # ---------------- Rule 7: Location Information Check ----------------
    missing_locs = []
    if not record.district or not record.district.strip():
        missing_locs.append("District")
    if not record.taluk or not record.taluk.strip():
        missing_locs.append("Taluk")
    if not record.village or not record.village.strip():
        missing_locs.append("Village")

    if missing_locs:
        errors.append(f"Missing mandatory location information: {', '.join(missing_locs)}.")
        suggestions.append("Select correct revenue District, Taluk and Village from administrative hierarchy.")
        rules_evaluated.append({
            "rule": "Location Completeness",
            "passed": False,
            "details": f"Missing: {', '.join(missing_locs)}"
        })
    else:
        rules_evaluated.append({
            "rule": "Location Completeness",
            "passed": True,
            "details": f"{record.village}, {record.taluk}, {record.district}"
        })

    # ---------------- Rule 8: Mismatch between Manually Entered and OCR Values ----------------
    if ocr_data and isinstance(ocr_data, dict):
        ocr_owner = ocr_data.get("owner_name")
        ocr_survey = ocr_data.get("survey_number")
        ocr_area = ocr_data.get("land_area")
        ocr_doc = ocr_data.get("document_number")

        ocr_checks_passed = True
        mismatches = []

        # Compare owner name
        if ocr_owner and record.owner_name:
            ocr_clean = re.sub(r'[^a-zA-Z]', '', ocr_owner.lower())
            form_clean = re.sub(r'[^a-zA-Z]', '', record.owner_name.lower())
            if ocr_clean not in form_clean and form_clean not in ocr_clean:
                warnings.append(f"OCR Owner Name mismatch: Form specifies '{record.owner_name}', but document OCR extracted '{ocr_owner}'.")
                suggestions.append(f"Review scanned document to ensure owner name matches '{ocr_owner}' or clarify power of attorney.")
                mismatches.append("Owner Name discrepancy")
                ocr_checks_passed = False

        # Compare survey number
        if ocr_survey and record.survey_number:
            ocr_sy = ocr_survey.replace(" ", "").lower()
            form_sy = record.survey_number.replace(" ", "").lower()
            if ocr_sy != form_sy:
                warnings.append(f"Survey Number mismatch: Form entered '{record.survey_number}' vs OCR scanned '{ocr_survey}'.")
                suggestions.append(f"Verify if deed is for Survey {ocr_survey}.")
                mismatches.append("Survey Number discrepancy")
                ocr_checks_passed = False

        # Compare land area
        if ocr_area is not None and record.land_area is not None:
            try:
                ocr_area_val = float(ocr_area)
                form_area_val = float(record.land_area)
                if abs(ocr_area_val - form_area_val) > 0.05:
                    warnings.append(f"Land Area mismatch: Form entered {form_area_val} {record.land_unit}, but OCR scanned {ocr_area_val}.")
                    suggestions.append(f"Confirm whether total extent is {ocr_area_val} as written on deed.")
                    mismatches.append("Land Area discrepancy")
                    ocr_checks_passed = False
            except (ValueError, TypeError):
                pass

        if ocr_checks_passed:
            rules_evaluated.append({
                "rule": "OCR Cross-Match",
                "passed": True,
                "details": "Form data matches OCR extracted document values with high confidence."
            })
        else:
            rules_evaluated.append({
                "rule": "OCR Cross-Match",
                "passed": False,
                "details": f"Discrepancies found: {', '.join(mismatches)}"
            })
    else:
        rules_evaluated.append({
            "rule": "OCR Cross-Match",
            "passed": True,
            "details": "No OCR scan provided or direct entry mode."
        })

    # ---------------- Determine Final Status ----------------
    if len(errors) > 0:
        final_status = "Rejected"
    elif len(warnings) > 0:
        final_status = "Pending"
    else:
        final_status = "Verified"

    return {
        "status": final_status,
        "error_count": len(errors),
        "warning_count": len(warnings),
        "errors": errors,
        "warnings": warnings,
        "suggestions": suggestions,
        "rules_evaluated": rules_evaluated
    }
