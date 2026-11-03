# Technical Implementation Details
## Intelligent Land Record Digitization and Validation System

This document outlines the core technical implementations across frontend, backend, OCR microservice, database layers, and DevOps pipelines.

---

## 1. Backend RESTful Architecture (FastAPI & SQLAlchemy)

### Key Modules:
- **`app/main.py`**:
  Initializes FastAPI with async lifespan management, automatic CORS middleware for cross-origin requests, static asset mounting (`/uploads`), and router registration.
- **`app/database.py`**:
  Features resilient database initialization. When executing in cloud/Docker environments, it connects to PostgreSQL (`psycopg2-binary`). When executing locally without Docker or PostgreSQL running, it automatically falls back to SQLite (`land_records.db`) and seeds synthetic records to ensure zero-friction testing.
- **`app/validation.py`**:
  Rule-based cadastral validation engine. Implements 8 discrete business rules:
  1. *Owner Name Presence & Syntax* (minimum 3 characters, alphabetic check).
  2. *Survey Number Format* (cadastral format `142/3A` check).
  3. *Duplicate Survey Conflict Detection* (scans existing records within the same district and village).
  4. *Document Registration Syntax Check* (`DOC-YYYY-REG-XXXX` format enforcement).
  5. *Land Area Positivity* (strictly positive real number, flags negative values or excessive areas > 5,000 acres).
  6. *Administrative Location Completeness* (District, Taluk, Village mandatory).
  7. *OCR Cross-Matching* (fuzzy text alignment between OCR extracted deed data and submitted form values).

### Endpoints Implemented:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate officer/admin and issue JWT |
| `GET` | `/api/auth/me` | Fetch active user credentials and role |
| `GET` | `/api/dashboard/stats` | Real-time database metrics, charts & activity |
| `GET` | `/api/records` | Search, filter by status/district, sort, paginate |
| `GET` | `/api/records/{id}` | Full record details with documents and report |
| `POST` | `/api/records` | Create new land record and trigger validation |
| `PUT` | `/api/records/{id}` | Edit land record fields and re-evaluate rules |
| `DELETE`| `/api/records/{id}` | Delete record, associated files, and validation |
| `POST` | `/api/documents/upload` | Ingest PDF/Image, save file, and trigger OCR |
| `GET` | `/api/documents/{id}` | Download or stream original deed file |
| `POST` | `/api/ocr/extract` | Direct OCR extraction for instant autofill preview |
| `GET` | `/api/validation/{id}` | Fetch detailed rule evaluation checklist |
| `POST` | `/api/validation/{id}` | Re-run validation against current database state |
| `GET` | `/api/admin/users` | List registered officers and administrators |
| `POST` | `/api/admin/users` | Register a new verification officer |
| `GET` | `/api/admin/activity` | Audit trail stream with IP addresses |
| `PUT` | `/api/admin/records/{id}/approve` | Administrator override approval |
| `PUT` | `/api/admin/records/{id}/reject` | Administrator override rejection with reason |
| `GET` | `/health` | Live probe testing API, Database, and OCR |
| `GET` | `/api/monitoring/status` | Container and infrastructure health telemetry |

---

## 2. OCR Microservice (Tesseract OCR & Image Processing)

### Architecture:
- Runs as an independent microservice on port `8001`.
- Built on `python:3.11-slim` with system packages `tesseract-ocr`, `tesseract-ocr-eng`, `libgl1`, and `libglib2.0-0`.
- Python libraries: `Pillow (PIL)`, `pytesseract`, `pypdf`, `fastapi`.

### Image Preprocessing Pipeline:
1. **Grayscale Conversion**: Eliminates color noise from scanned watermarks.
2. **Autocontrast Enhancement**: Sharpens text edges against degraded background paper.
3. **Sharpening Filter**: Applied via `ImageFilter.SHARPEN` before character segmentation.

### Regular Expression Entity Extraction:
- **Owner Name**: `(?:Owner(?:\s*Name)?|Khatedar|Pattadar|Kattedar)\s*[:\-]?\s*([A-Za-z\s\.\']{3,50})`
- **Survey Number**: `(?:Survey\s*(?:No|Number|\#)?|Sy\s*(?:No)?|Khasra)\s*[:\.\-]?\s*([0-9]+(?:\/[0-9]+[A-Za-z]*)?)`
- **ULPIN**: `(?:ULPIN|Property\s*ID|Bhudhar)\s*[:\-]?\s*([A-Z0-9\-]{10,25})`
- **Land Extent**: `(?:Area|Extent|Land\s*Area)\s*[:\-]?\s*([0-9]+(?:\.[0-9]+)?)\s*(Acres?|Guntas?|Hectares?|Sq\.?\s*ft)?`
- **Document Number**: `(?:Document\s*No|Registration\s*No|Deed\s*No)\s*[:\-]?\s*([A-Z0-9\-\/]{4,30})`

---

## 3. Frontend Web Client (React 18, Vite, Tailwind CSS, Recharts)

### Design Aesthetic:
- Government portal palette: Navy Blue (`#0B2545`), Accent Teal (`#0D9488`), White (`#FFFFFF`), Soft Slate Background (`#F8FAFC`).
- Consistent typography: Google Font **Inter**.
- Status Badges:
  - **Verified**: Teal badge with `CheckCircle2` icon.
  - **Pending**: Amber badge with `Clock` icon.
  - **Rejected**: Rose badge with `XCircle` icon.

### Key Pages:
- **Login (`pages/Login.jsx`)**:
  Features 1-click evaluation demo credential buttons for Admin (`admin@landrecords.gov.in`) and Officer (`officer@landrecords.gov.in`), password show/hide toggle, and JWT storage.
- **Dashboard (`pages/Dashboard.jsx`)**:
  Real-time database-driven metrics, Recharts Donut status breakdown, Recharts monthly bar chart, recent document ingestion table, and live audit feed.
- **Land Record Upload (`pages/LandRecordUpload.jsx`)**:
  Drag-and-drop document upload with real-time OCR extraction preview. Extracted fields automatically populate form inputs for human-in-the-loop verification.
- **Registry & Records (`pages/LandRecords.jsx`)**:
  Searchable, filterable table with modal-driven editing, deletion confirmations, and validation report inspection.
- **Record Details (`pages/RecordDetails.jsx`)**:
  Full cadastral dossier with OCR text stream, attached document viewer, administrative location hierarchy, and audit timeline.
- **Admin Panel (`pages/AdminPanel.jsx`)**:
  Pending approval determination queue, officer onboarding, and system activity inspection.
- **System Monitoring (`pages/SystemMonitoring.jsx`)**:
  Live DevOps health dashboard probing API latency, PostgreSQL connectivity, OCR microservice status, and container deployment matrix.
