# Intelligent Land Record Digitization and Validation System (BHU-VAIDYA)
> **A Six-Member College DevOps Project**  
> *Production-Ready Full-Stack Web Application with Automated Optical Character Recognition (OCR), Rule-Based Cadastral Validation, Multi-Container Docker Orchestration, Kubernetes (Minikube) Manifests, Declarative Jenkins CI/CD, and AWS EC2 Cloud Deployment.*

---

## 1. Project Overview & Problem Statement

### Problem Statement
In conventional land revenue and cadastral administration, legacy land ownership records, title deeds, Record of Rights, Tenancy and Crops (RTC / 7/12 / Patta), and mutation registers are predominantly maintained in physical, paper-based forms. This creates severe systemic challenges:
1. **Slow and Error-Prone Manual Transcription**: Field clerks manually re-type deeds, causing spelling inconsistencies, incorrect cadastral survey numbers, and misallocated land areas.
2. **Duplicate Survey Number Allocation**: Paper systems lack instant cadastral cross-verification, enabling unintentional or fraudulent double-allocation of the same survey number within a single village.
3. **Data Loss & Physical Degradation**: Fragile, centuries-old deed documents are vulnerable to environmental decay, ink fading, and physical misplacement.
4. **Lack of Automated Cadastral Validation**: Discrepancies between the physical scanned deed and digital entries are rarely flagged in real-time, requiring cumbersome manual physical audits.

### Proposed Solution
**BHU-VAIDYA** (Intelligent Land Record Digitization and Validation System) provides an end-to-end automated platform that:
- Ingests scanned land deeds, RTCs, and mutation documents in PDF, PNG, and JPG formats.
- Employs **Tesseract Optical Character Recognition (OCR)** alongside image preprocessing filters to automatically digitize and extract critical entities (Owner Legal Name, Survey Number, ULPIN / Property ID, Village, Taluk, District, Land Extent, and Registration Deed Numbers).
- Executes an **Intelligent Cadastral Validation Engine** that verifies 8 business and topological rules (syntax formatting, positivity of land area, location completeness, duplicate survey detection in the village, and cross-matching between OCR text and user entries).
- Delivers a role-based, government technology portal (React 18, Vite, Tailwind CSS, Recharts) with live database metrics, full-text registry search, administrative approvals, and real-time container health diagnostics.
- Provides a complete DevOps lifecycle using **Docker, Docker Compose, Kubernetes, Jenkins, and AWS Cloud**.

---

## 2. Key Features

- **Government Technology Dashboard**: Real-time database metrics, Recharts status breakdown donut, monthly ingestion bar charts, recent documents list, and immutable audit activity feed.
- **Automated OCR Digitization**: Scans uploaded deeds and extracts structured fields, providing a human-in-the-loop autofill interface for rapid clerical review.
- **Intelligent Cadastral Validation Engine**:
  - Flags missing or invalid owner names.
  - Validates cadastral survey number syntax (`142/3A`).
  - Detects duplicate survey number allocations within the same district and village.
  - Enforces positive numeric land area bounds.
  - Ensures administrative location hierarchy completeness (District, Taluk, Village).
  - Cross-matches manual inputs with OCR-extracted values and flags discrepancies.
  - Categorizes records into three official states: **Verified**, **Pending**, and **Rejected**.
- **Searchable & Filterable Registry**: Full-text search by owner, survey number, ULPIN, or village; filter by status and district; sort and paginate records; edit and delete with confirmation modals.
- **Cadastral Dossier View**: Comprehensive parcel overview including high-resolution document previews, Tesseract raw OCR text stream, entity breakdown, and audit timeline.
- **Administrative Governance Panel**: Review queue of pending records with one-click Approve / Reject decisions, officer user onboarding, and system-wide activity log inspection.
- **DevOps Health & Infrastructure Center**: Real-time live HTTP diagnostic probes measuring API latency, PostgreSQL database connectivity, and OCR microservice readiness.

---

## 3. Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Web Client** | React 18, Vite 5, Tailwind CSS, Lucide React Icons, Recharts |
| **Backend REST API** | Python 3.11, FastAPI, Pydantic v2, SQLAlchemy ORM, Uvicorn |
| **Database** | PostgreSQL 16 (with resilient SQLite auto-fallback for zero-friction local testing) |
| **OCR Microservice** | Tesseract OCR 5.x, Pytesseract, Pillow (PIL), PyPDF |
| **Containerization** | Docker Engine, Multi-Stage Dockerfiles, Docker Compose v2 |
| **Orchestration** | Kubernetes (Minikube / AWS EKS), Deployments, Services, ConfigMaps, Secrets, PVC |
| **CI/CD Automation** | Jenkins Declarative Pipeline (7 Stages) |
| **Cloud Hosting** | Amazon Web Services (AWS) EC2 Ubuntu 24.04/22.04 LTS |
| **Virtualization** | Windows Subsystem for Linux (WSL 2), Oracle VM VirtualBox |

---

## 4. Strict Folder Structure

```
intelligent-land-record-digitization/
│
├── frontend/                     # React 18 + Vite + Tailwind CSS Web Client
│   ├── public/                   # Static public assets
│   ├── src/
│   │   ├── components/           # Navbar, Sidebar, StatCard, StatusBadge, Modals
│   │   ├── pages/                # Login, Dashboard, Upload, Registry, Dossier, Admin, Monitoring
│   │   ├── services/             # API client (fetch) & Auth state helper
│   │   ├── assets/               # Image & icon assets
│   │   ├── App.jsx               # Main application component & routing
│   │   ├── main.jsx              # DOM root mount
│   │   └── index.css             # Tailwind base & custom styles
│   ├── package.json              # NPM dependencies & scripts
│   ├── vite.config.js            # Vite configuration with API proxy
│   ├── tailwind.config.js        # Government Navy/Teal theme tokens
│   ├── postcss.config.js         # PostCSS plugins
│   ├── nginx.conf                # Nginx production configuration
│   ├── index.html                # HTML5 entrypoint
│   └── Dockerfile                # Multi-stage production container build
│
├── backend/                      # FastAPI Python Core Backend
│   ├── app/
│   │   ├── routes/               # auth, dashboard, records, documents, ocr, validation, admin, health
│   │   ├── models/               # SQLAlchemy ORM models & Pydantic v2 schemas
│   │   ├── services/             # JWT auth, OCR HTTP client, and business helpers
│   │   ├── main.py               # FastAPI entrypoint & router registration
│   │   ├── database.py           # SQLAlchemy engine & resilient PostgreSQL/SQLite fallback
│   │   └── validation.py         # Intelligent Cadastral Rule Validation Engine
│   ├── tests/                    # Pytest test suite (test_api.py)
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Production Python container build
│
├── ocr-service/                  # Standalone OCR & Text Extraction Microservice
│   ├── app/
│   │   ├── main.py               # FastAPI microservice on port 8001
│   │   └── extract_text.py       # Tesseract OCR & regex cadastral entity extraction
│   ├── requirements.txt          # OCR dependencies (pytesseract, Pillow, pypdf)
│   └── Dockerfile                # Debian/Ubuntu image with Tesseract OCR binary
│
├── database/
│   └── init.sql                  # PostgreSQL schema DDL, indexes, and synthetic seed data
│
├── docker/
│   ├── docker-compose.yml        # Multi-container orchestration (Frontend, Backend, OCR, DB)
│   └── .env.example              # Environment variables template
│
├── k8s/                          # Kubernetes Manifests
│   ├── deployments/              # frontend.yaml, backend.yaml, ocr.yaml, database.yaml
│   ├── services/                 # services.yaml (ClusterIP & NodePort services)
│   ├── configmaps/               # app-config.yaml
│   ├── secrets/                  # secret-template.yaml
│   └── storage/                  # postgres-pvc.yaml (5Gi Persistent Volume Claim)
│
├── cloud/                        # AWS EC2 Cloud Documentation
│   ├── aws-setup.md              # Instance sizing, SSH connection & Docker setup
│   ├── deployment-guide.md       # End-to-end Git clone, build & HTTPS deployment
│   └── security-groups.md        # Firewall rules and network security architecture
│
├── virtualization/               # Local VM & Linux Guides
│   ├── virtualbox-setup.md       # Oracle VirtualBox VM creation, RAM/CPU & networking
│   ├── ubuntu-setup.md           # Native Ubuntu Linux, Tesseract & UFW configuration
│   └── wsl-setup.md              # WSL 2 setup & Docker desktop integration on Windows
│
├── scripts/                      # Shell Automation Scripts
│   ├── start.sh                  # Start Docker Compose services
│   ├── stop.sh                   # Stop Docker Compose services
│   ├── health-check.sh           # Automated health check diagnostic probe
│   └── setup.sh                  # Preflight environment preparation
│
├── documentation/                # Complete Technical Documentation
│   ├── architecture.md           # Architecture diagrams, sequences & database ERD
│   ├── implementation.md         # Implementation details, APIs & OCR heuristics
│   ├── commands.md               # Cheatsheet of Linux, Git, Docker, K8s, Jenkins & AWS commands
│   ├── team-roles.md             # Responsibilities divided across the 6 members
│   └── testing.md                # Test plan, pytest suite & verification matrix
│
├── screenshots/                  # Screenshot submission guides & visual proof
│   ├── frontend/                 # UI screenshots
│   ├── ubuntu/                   # Linux terminal screenshots
│   ├── virtualbox/               # VirtualBox VM screenshots
│   ├── docker/                   # Docker build & ps screenshots
│   ├── kubernetes/               # Minikube & kubectl screenshots
│   ├── jenkins/                  # CI/CD pipeline stage view screenshots
│   └── cloud/                    # AWS EC2 console screenshots
│
├── Jenkinsfile                   # Declarative Jenkins CI/CD pipeline (7 stages)
├── .gitignore                    # Git ignore file
└── README.md                     # Project master documentation
```

---

## 5. Demo Credentials

The database comes pre-seeded with two demo accounts for testing:

| Role | Email | Password | Department |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@landrecords.gov.in` | `admin123` | State Land Administration Directorate |
| **Revenue Officer** | `officer@landrecords.gov.in` | `officer123` | Taluk Revenue Office - Bengaluru North |

> **Note:** The login screen includes **1-Click Evaluation Buttons** to automatically fill credentials. You can also switch active roles on the fly using the **"Switch to Admin/Officer"** button in the sidebar.

---

## 6. How to Run the Project Locally (Without Docker)

You can run the frontend, backend, and OCR service directly on your development machine:

### Step 1: Start OCR Microservice
```bash
cd ocr-service
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

### Step 2: Start Backend REST API
Open a second terminal:
```bash
cd backend
python -m venv venv
# On Windows: venv\Scripts\activate | On Linux/macOS: source venv/bin/activate
pip install -r requirements.txt
# Notice: If PostgreSQL is not running locally, backend automatically uses SQLite (land_records.db) with pre-seeded data!
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Step 3: Start React 18 Frontend
Open a third terminal:
```bash
cd frontend
npm install
npm run dev
```

Open your browser at `http://localhost:3000`.

---

## 7. How to Run with Docker & Docker Compose (Recommended)

Docker Compose builds and orchestrates all 4 services (Frontend, Backend, OCR Service, and PostgreSQL):

```bash
# 1. Create the environment configuration
cp docker/.env.example docker/.env

# 2. Build and launch all containers
docker compose -f docker/docker-compose.yml up -d --build

# 3. Verify running containers and health status
docker compose -f docker/docker-compose.yml ps

# 4. View live aggregated logs
docker compose -f docker/docker-compose.yml logs -f

# 5. Stop all containers
docker compose -f docker/docker-compose.yml down
```

Access Points:
- **Frontend Web Portal**: `http://localhost:3000`
- **Backend API & Swagger UI**: `http://localhost:8000/docs`
- **OCR Microservice Health**: `http://localhost:8001/health`
- **System Health Diagnostics**: `http://localhost:8000/health`

---

## 8. How to Deploy to Kubernetes (Minikube)

Deploy the application to a local Minikube cluster:

```bash
# 1. Start Minikube
minikube start --driver=docker --cpus=2 --memory=4096

# 2. Apply Storage, ConfigMaps, and Secrets
kubectl apply -f k8s/storage/postgres-pvc.yaml
kubectl apply -f k8s/configmaps/app-config.yaml
kubectl apply -f k8s/secrets/secret-template.yaml

# 3. Apply Microservice Deployments
kubectl apply -f k8s/deployments/database.yaml
kubectl apply -f k8s/deployments/ocr.yaml
kubectl apply -f k8s/deployments/backend.yaml
kubectl apply -f k8s/deployments/frontend.yaml

# 4. Apply Services
kubectl apply -f k8s/services/services.yaml

# 5. Check Pod status
kubectl get pods -o wide
kubectl get svc

# 6. Open Frontend in Browser
minikube service frontend-service
```

---

## 9. Jenkins CI/CD Pipeline

The root-level `Jenkinsfile` implements a declarative pipeline with **7 defined stages**:
1. **Checkout from GitHub**: Clones code from the remote repository.
2. **Install Dependencies**: Installs NPM packages and Python virtual environments.
3. **Frontend Build**: Compiles the React 18 application bundle via Vite.
4. **Backend Tests**: Executes automated Pytest tests (`test_api.py`) for validation rules and API endpoints.
5. **Docker Image Build**: Builds images for `frontend`, `backend`, and `ocr-service`.
6. **Docker Image Tagging**: Tags images with the build number and `latest`.
7. **Kubernetes Deployment**: Executes `kubectl apply -f k8s/` to deploy the updated services.

Refer to [`documentation/commands.md`](./documentation/commands.md) and [`Jenkinsfile`](./Jenkinsfile) for Jenkins configuration and credential setup.

---

## 10. AWS Cloud Deployment

Deploy on an Ubuntu 24.04 / 22.04 LTS EC2 instance:
1. Provision a `t3.medium` EC2 instance with 30GB EBS storage.
2. Attach the security group defined in [`cloud/security-groups.md`](./cloud/security-groups.md) (Port 80, 443, 22).
3. Connect via SSH: `ssh -i key.pem ubuntu@<EC2_PUBLIC_IP>`.
4. Install Docker and clone this repository.
5. Launch with `docker compose -f docker/docker-compose.yml up -d --build`.
6. Optionally configure SSL/TLS HTTPS using Certbot and Let's Encrypt.

Detailed cloud setup instructions are provided in [`cloud/aws-setup.md`](./cloud/aws-setup.md) and [`cloud/deployment-guide.md`](./cloud/deployment-guide.md).

---

## 11. Six-Member Team Responsibilities

| Member | Assigned Role | Core Responsibilities & Deliverables |
| :--- | :--- | :--- |
| **Member 1** | **Frontend Engineer** | React 18, Vite, Tailwind CSS, Recharts, UI components, Login, Dashboard, Registry, Dossier, and Monitoring pages. |
| **Member 2** | **Backend Engineer** | FastAPI REST API endpoints, Pydantic models, JWT authentication, and the Intelligent Cadastral Validation Engine. |
| **Member 3** | **Database & OCR Engineer** | PostgreSQL 16 schema (`init.sql`), synthetic seed data, Tesseract OCR microservice, and regex entity extractors. |
| **Member 4** | **Docker & Compose Engineer**| Multi-stage Dockerfiles, `docker-compose.yml`, container networking, persistent volumes, and health checks. |
| **Member 5** | **K8s & Jenkins Engineer** | Kubernetes manifests (`k8s/`), Minikube testing, declarative `Jenkinsfile` (7 stages), and automated Pytest test suite. |
| **Member 6** | **Cloud & Virtualization** | AWS EC2 guide, security groups, VirtualBox & WSL setup, shell scripts (`start.sh`, `health-check.sh`), and test documentation. |

Refer to [`documentation/team-roles.md`](./documentation/team-roles.md) for full individual deliverables.

---

## 12. License & Academic Disclaimer
Developed as a DevOps Capstone Demonstration Project. Validation algorithms are rule-based for digitization screening and do not constitute legal judicial title certification.
