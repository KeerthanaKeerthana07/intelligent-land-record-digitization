# System Architecture & Technical Specifications
## Intelligent Land Record Digitization and Validation System

This document outlines the architecture, data flows, database entity relationships, and infrastructure topology of the **Intelligent Land Record Digitization and Validation System (BHU-VAIDYA)**.

---

## 1. High-Level Architectural Diagram

The system follows a decoupled, microservices-oriented architecture designed for scalability, zero-trust container isolation, and cloud portability:

```mermaid
graph TD
    User([Civilian / Revenue Officer]) -->|HTTPS / Port 80| Nginx[Frontend Web Server / Nginx]
    Nginx -->|Static Assets| ReactApp[React 18 SPA Client]
    Nginx -->|Reverse Proxy /api| BackendAPI[FastAPI Backend Core]
    
    subgraph Containerized Application Tier
        BackendAPI -->|Authentication & AuthZ| JWTModule[JWT / SHA-256 Auth]
        BackendAPI -->|Cadastral Validation| ValidationEngine[Intelligent Validation Engine]
        BackendAPI -->|HTTP REST /extract| OCRMicroservice[OCR Microservice - Port 8001]
    end

    subgraph OCR Processing Tier
        OCRMicroservice -->|Image Preprocessing| PillowEnhance[PIL Contrast & Grayscale]
        OCRMicroservice -->|Optical Text Recognition| TesseractEngine[Tesseract OCR Engine]
        OCRMicroservice -->|Regex Entity Parsing| EntityExtractor[Cadastral Heuristic Parser]
    end

    subgraph Data Persistence Tier
        BackendAPI -->|SQLAlchemy ORM / Port 5432| PostgreSQL[(PostgreSQL 16 Database)]
        BackendAPI -->|Local File Volume| DiskUploads[(Encrypted Document Storage)]
    end
```

---

## 2. Ingestion & Intelligent Validation Workflow

When an officer uploads a land deed, mutation extract, or Patta certificate:

```mermaid
sequenceDiagram
    autonumber
    actor Officer as Revenue Officer
    participant Frontend as React 18 Web Client
    participant Backend as FastAPI Backend
    participant OCR as OCR Microservice
    participant DB as PostgreSQL Database

    Officer->>Frontend: Uploads Land Document (PDF/PNG/JPG)
    Frontend->>Backend: POST /api/documents/upload (multipart/form-data)
    Backend->>Backend: Validates MIME type & stores in /app/uploads
    Backend->>OCR: POST /extract (forward bytes)
    OCR->>OCR: Preprocess Image (Autocontrast & Sharpen)
    OCR->>OCR: Tesseract OCR text extraction
    OCR->>OCR: Regex parsing (Survey No, Owner, ULPIN, Area)
    OCR-->>Backend: JSON (raw_text, entities, confidence_score)
    Backend->>DB: Stores UploadedDocument record
    Backend-->>Frontend: Returns extracted metadata
    Frontend->>Officer: Form auto-filled with extracted data for review
    Officer->>Frontend: Verifies/Edits form and clicks Submit
    Frontend->>Backend: POST /api/records (create with document_id)
    Backend->>Backend: Evaluates Cadastral Rule Suite:
    Note over Backend: 1. Owner Name Presence<br/>2. Survey Number Syntax<br/>3. Duplicate Survey in Village<br/>4. Land Area > 0<br/>5. Location Completeness<br/>6. OCR Cross-Match
    Backend->>DB: Persists LandRecord and ValidationResult
    Backend->>DB: Writes immutable ActivityLog entry
    Backend-->>Frontend: Returns LandRecord with status (Verified/Pending/Rejected)
    Frontend->>Officer: Displays instant Interactive Validation Report
```

---

## 3. Database Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    users ||--o{ land_records : "creates"
    land_records ||--o{ uploaded_documents : "attaches"
    land_records ||--|| validation_results : "evaluated by"
    users ||--o{ activity_logs : "audited in"

    users {
        int id PK
        string email UK
        string hashed_password
        string full_name
        string role "admin | officer"
        string department
        boolean is_active
        timestamp created_at
    }

    land_records {
        int id PK
        string owner_name
        string survey_number
        string ulpin UK
        string district
        string taluk
        string village
        float land_area
        string land_unit
        string land_type
        string document_number
        string status "Verified | Pending | Rejected"
        text notes
        timestamp created_at
        timestamp updated_at
        int created_by_id FK
    }

    uploaded_documents {
        int id PK
        int record_id FK
        string file_name
        string original_file_name
        string file_path
        string file_type
        int file_size
        text ocr_raw_text
        jsonb ocr_extracted_data
        timestamp uploaded_at
    }

    validation_results {
        int id PK
        int record_id FK
        string status
        int error_count
        int warning_count
        jsonb errors_json
        jsonb warnings_json
        jsonb suggestions_json
        jsonb rules_evaluated_json
        timestamp validated_at
    }

    activity_logs {
        int id PK
        string user_email
        string action
        text details
        string ip_address
        timestamp created_at
    }
```

---

## 4. Multi-Tier Security Framework

1. **Authentication:**
   - Stateless JWT tokens (`HS256`) signed with a configurable server secret.
   - SHA-256 password salting for stored officer passwords.
2. **Access Control:**
   - Role-Based Access Control (`admin` vs `officer`).
   - Administrative override controls for approvals/rejections and user onboarding.
3. **Database Security:**
   - Database resides in an internal Docker network inaccessible to the public internet.
   - Parameterized queries via SQLAlchemy ORM preventing SQL injection attacks.
4. **Input Sanitization & Validation:**
   - Pydantic v2 schemas validating payload structure, types, string lengths, and numeric bounds.
   - File extension and size throttling (max 15MB) to mitigate denial-of-service.
