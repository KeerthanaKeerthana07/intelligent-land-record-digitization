# Test Plan & Verification Documentation
## Intelligent Land Record Digitization and Validation System

This document outlines the test cases, validation scenarios, and verification steps across unit testing, integration testing, container health checks, and end-to-end user workflows.

---

## 1. Automated Test Suite (Pytest)

The backend includes automated tests located in `backend/tests/test_api.py`.

### How to Run Automated Tests:
```bash
cd backend
python -m pytest tests/test_api.py -v
```

### Test Cases Covered:
| Test ID | Test Function | Description | Expected Result |
| :--- | :--- | :--- | :--- |
| **TC-01** | `test_health_endpoint` | Verifies `/health` endpoint returns JSON with database and microservice status | HTTP 200, status `healthy` |
| **TC-02** | `test_dashboard_stats` | Verifies `/api/dashboard/stats` queries records from database | HTTP 200, valid counts |
| **TC-03** | `test_login_valid_credentials` | Tests authentication for `admin@landrecords.gov.in` | HTTP 200, JWT access token returned |
| **TC-04** | `test_login_invalid_credentials` | Tests authentication rejection for wrong password | HTTP 401 Unauthorized |
| **TC-05** | `test_validation_rule_negative_area` | Tests rule engine flagging negative land area (`-5.0 Acres`) | Status `Rejected`, error message recorded |
| **TC-06** | `test_validation_rule_missing_owner` | Tests rule engine flagging missing owner name | Status `Rejected`, owner error recorded |

---

## 2. Functional Feature Verification Matrix

### A. Authentication & Access Control
- [x] **Login Page**: Input fields validate email format and non-empty password.
- [x] **Password Show/Hide**: Eye toggle switches input between masked and visible text.
- [x] **1-Click Demo Buttons**: Clicking "Admin User" or "Officer User" instantly populates correct demo credentials.
- [x] **Session Storage**: JWT token saved in `localStorage`; automatically included in `Authorization: Bearer <token>` requests.
- [x] **Role Guard**: Admin actions (such as registering new officers) are restricted to authorized roles.

### B. Dashboard Analytics
- [x] **Live Database Counts**: Total Records, Verified, Pending, and Rejected counts match actual records in PostgreSQL.
- [x] **Total Land Area**: Calculated as the mathematical sum of positive land parcel extents from the database.
- [x] **Interactive Recharts Donut**: Displays distribution of Verified (teal), Pending (amber), and Rejected (rose) records.
- [x] **Monthly Upload Volume**: Bar chart dynamically categorizes records by upload month.
- [x] **Real-Time Audit Feed**: Displays recent activity log entries with timestamps and user emails.

### C. Land Record Upload & OCR Digitization
- [x] **Drag-and-Drop Area**: Accepts PDF, PNG, JPG, JPEG files; rejects unsupported file extensions.
- [x] **Size Throttling**: Rejects files larger than 15MB with a clear warning.
- [x] **Tesseract OCR Ingestion**: Reads uploaded document bytes, performs image enhancement, and streams raw text.
- [x] **Automated Form Autofill**: Extracted fields (Owner Name, Survey Number, ULPIN, Land Area) automatically populate form inputs for human review.
- [x] **Instant Validation Modal**: Submitting the form triggers the rule-based validation engine and immediately pops up the validation report.

### D. Intelligent Validation Engine Test Cases
| Scenario | Input Condition | Expected System Behavior |
| :--- | :--- | :--- |
| **Valid Deed** | Complete owner, valid survey (e.g. `142/3A`), positive area (`3.75`), valid DOC number | Status: **Verified** (0 errors, 0 warnings) |
| **Negative Area** | Land area set to `-2.50 Acres` | Status: **Rejected**, Error: *"Land area cannot be negative"* |
| **Missing Location** | District, Taluk, or Village left empty | Status: **Rejected**, Error: *"Missing mandatory location"* |
| **Duplicate Survey** | Survey `142/3A` re-registered in Village `Yelahanka`, `Bengaluru Urban` | Status: **Rejected**, Error: *"Duplicate Survey Number detected in Village"* |
| **OCR Discrepancy** | Form specifies `Ramesh Kumar` but OCR scanned document specifies `Ananya Sundaram` | Status: **Pending**, Warning: *"OCR Owner Name mismatch"* |
| **Invalid Doc Syntax**| Registration deed number formatted as `INV-DOC-000` | Status: **Rejected**, Error: *"Invalid document number format"* |

### E. Registry Management & Actions
- [x] **Instant Search**: Typing in the search bar dynamically filters records by Owner, Survey Number, or Village.
- [x] **Status Filter**: Filtering by `Verified`, `Pending`, or `Rejected` correctly updates table rows.
- [x] **Pagination**: Forward and backward navigation adjusts offset and limit correctly.
- [x] **Edit Modal**: Editing record fields and saving immediately re-runs validation against the database.
- [x] **Delete Confirmation**: Deleting a record displays a confirmation modal and cleans up linked document metadata.

### F. Administrative Workflows
- [x] **Approvals Queue**: Administrators can inspect pending records and approve or reject them with an official note.
- [x] **User Management**: Administrators can register new verification officers.
- [x] **Audit Trail**: Every creation, update, approval, rejection, and login event is permanently recorded in `activity_logs`.

### G. System Monitoring & DevOps
- [x] **Backend Ping**: Real-time HTTP probe measures round-trip API latency in milliseconds.
- [x] **Database Connectivity**: Probes PostgreSQL with `SELECT 1` and counts indexed parcels.
- [x] **OCR Microservice Probe**: Verifies health of the Tesseract OCR engine on port 8001.

---

## 3. Container & Infrastructure Health Checks

### Docker Compose Verification:
```bash
docker compose -f docker/docker-compose.yml ps
```
*Expected Result:*
- `land_records_db`: `Up (healthy)`
- `land_records_ocr`: `Up (healthy)`
- `land_records_backend`: `Up (healthy)`
- `land_records_frontend`: `Up (healthy)`

### Automated Script Check:
```bash
./scripts/health-check.sh
```
*Expected Result:* Returns HTTP 200 for all endpoints.
