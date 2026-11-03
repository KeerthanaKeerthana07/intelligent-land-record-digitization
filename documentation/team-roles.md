# Six-Member College DevOps Project Team Structure
## Intelligent Land Record Digitization and Validation System

This project is organized across six distinct engineering roles, mirroring a professional DevOps and full-stack software development team.

---

## Team Responsibility Matrix

```
┌────────────────────────────────────────────────────────────────────────┐
│                   PROJECT LEADERSHIP & ARCHITECTURE                    │
└────────────────────────────────────────────────────────────────────────┘
       │                 │                 │                 │
       ▼                 ▼                 ▼                 ▼
 ┌───────────┐     ┌───────────┐     ┌───────────┐     ┌───────────┐
 │ Member 1  │     │ Member 2  │     │ Member 3  │     │ Member 4  │
 │ Frontend  │     │  Backend  │     │  DB & OCR │     │  Docker & │
 │  UI/UX    │     │  REST API │     │  Service  │     │  Compose  │
 └───────────┘     └───────────┘     └───────────┘     └───────────┘
                         │                 │
                         ▼                 ▼
                   ┌───────────┐     ┌───────────┐
                   │ Member 5  │     │ Member 6  │
                   │ K8s &     │     │ Linux, VM │
                   │ Jenkins   │     │ & AWS     │
                   └───────────┘     └───────────┘
```

---

### Member 1: Frontend Development Engineer
- **Primary Domain**: React 18, Vite, Tailwind CSS, Lucide React, Recharts.
- **Responsibilities**:
  - Implemented the responsive government-themed user interface (`frontend/src/`).
  - Developed the **Login Page** with role toggling and evaluation presets (`Login.jsx`).
  - Built the dynamic **Dashboard** displaying live database metrics and interactive charts (`Dashboard.jsx`).
  - Created the **Land Record Upload** form with drag-and-drop document upload and OCR autofill preview (`LandRecordUpload.jsx`).
  - Created the **Cadastral Records Registry** with search, filters, pagination, edit modal, and delete workflow (`LandRecords.jsx`).
  - Developed the **Record Details Dossier** with document preview and OCR text stream viewer (`RecordDetails.jsx`).
  - Designed the **System Monitoring** UI displaying live container and API health telemetry (`SystemMonitoring.jsx`).
- **Deliverables**: `frontend/src/*`, `frontend/package.json`, `frontend/vite.config.js`, `frontend/tailwind.config.js`.

---

### Member 2: Backend Development Engineer
- **Primary Domain**: Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, JWT Authentication.
- **Responsibilities**:
  - Designed and built all 20 RESTful API endpoints (`backend/app/routes/`).
  - Developed the **Intelligent Cadastral Validation Engine** with 8 rule checks (`backend/app/validation.py`).
  - Implemented secure JWT authentication and role-based access control (`backend/app/services/auth_service.py`).
  - Implemented automatic SQLite/PostgreSQL dynamic fallback database connector (`backend/app/database.py`).
  - Handled document storage and multipart form processing (`backend/app/routes/documents.py`).
  - Configured Swagger UI and OpenAPI documentation generation at `/docs`.
- **Deliverables**: `backend/app/*`, `backend/requirements.txt`, `backend/Dockerfile`.

---

### Member 3: Database & OCR Service Engineer
- **Primary Domain**: PostgreSQL 16, Tesseract OCR, Pytesseract, Pillow, Regular Expression Heuristics.
- **Responsibilities**:
  - Designed the relational PostgreSQL database schema with indexes, foreign keys, and constraints (`database/init.sql`).
  - Authored realistic synthetic seed data covering Verified, Pending, and Conflicting/Rejected records across Karnataka districts.
  - Implemented the standalone **Tesseract OCR Microservice** (`ocr-service/app/`).
  - Built image enhancement pipelines (autocontrast, grayscale, sharpening) to optimize OCR text extraction.
  - Developed regex and heuristic pattern extractors for Owner Name, Survey Number, ULPIN, Land Area, and Deed Numbers.
- **Deliverables**: `database/init.sql`, `ocr-service/app/*`, `ocr-service/requirements.txt`, `ocr-service/Dockerfile`.

---

### Member 4: Containerization & Docker Compose Engineer
- **Primary Domain**: Docker Engine, Multi-Stage Dockerfiles, Docker Compose, Container Networking.
- **Responsibilities**:
  - Authored multi-stage production Dockerfiles for Frontend (Node alpine build -> Nginx alpine), Backend, and OCR Service.
  - Created the unified `docker/docker-compose.yml` orchestrating all four services simultaneously.
  - Configured isolated bridge container networking (`land_record_network`).
  - Implemented robust container health checks (`pg_isready` for DB, `curl` for API/OCR, `wget` for Frontend).
  - Configured persistent Docker volumes (`land_records_pgdata` and `land_records_uploads`).
  - Authored environment templates (`docker/.env.example`).
- **Deliverables**: `docker/docker-compose.yml`, `docker/.env.example`, `frontend/Dockerfile`, `backend/Dockerfile`, `ocr-service/Dockerfile`.

---

### Member 5: Kubernetes & Jenkins CI/CD Engineer
- **Primary Domain**: Kubernetes (K8s), Minikube, kubectl, Declarative Jenkins Pipelines.
- **Responsibilities**:
  - Authored Kubernetes Deployments with resource requests, limits, and liveness/readiness probes (`k8s/deployments/`).
  - Created Kubernetes ClusterIP and NodePort Services (`k8s/services/services.yaml`).
  - Configured PersistentVolumeClaims (`k8s/storage/postgres-pvc.yaml`) for database persistence.
  - Created ConfigMaps (`k8s/configmaps/app-config.yaml`) and Secret templates (`k8s/secrets/secret-template.yaml`).
  - Authored the root-level declarative `Jenkinsfile` with 7 stages (Checkout, Dependencies, Build, Tests, Docker Build, Tag, K8s Deploy).
  - Wrote backend automated test suites (`backend/tests/test_api.py`) for CI integration.
- **Deliverables**: `k8s/*`, `Jenkinsfile`, `backend/tests/test_api.py`.

---

### Member 6: Virtualization, Cloud Infrastructure & Testing Engineer
- **Primary Domain**: AWS EC2 Cloud, Security Groups, Oracle VirtualBox, WSL 2, Ubuntu Linux, Automation Scripts.
- **Responsibilities**:
  - Prepared the complete AWS EC2 Cloud deployment guide on Ubuntu 24.04 LTS (`cloud/aws-setup.md`, `cloud/deployment-guide.md`).
  - Configured AWS Security Groups, firewall rules, and SSL/TLS HTTPS setup instructions (`cloud/security-groups.md`).
  - Authored step-by-step guides for Oracle VirtualBox and Windows Subsystem for Linux (`virtualization/*`).
  - Developed automation shell scripts (`scripts/start.sh`, `scripts/stop.sh`, `scripts/health-check.sh`, `scripts/setup.sh`).
  - Prepared test documentation, test cases, and commands cheatsheet (`documentation/testing.md`, `documentation/commands.md`).
- **Deliverables**: `cloud/*`, `virtualization/*`, `scripts/*`, `documentation/testing.md`.
