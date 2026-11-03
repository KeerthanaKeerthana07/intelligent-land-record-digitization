# Project Screenshots & Demonstration Artifacts
## Intelligent Land Record Digitization and Validation System

This directory is organized into dedicated categories for saving visual proof and demonstration artifacts for project submission and college evaluation.

---

## Directory Organization

### 1. `screenshots/frontend/`
Save screenshots of the web application user interface:
- `01_login_page.png` - Login page with role selector and demo credentials.
- `02_dashboard.png` - Main dashboard with KPIs, status donut, and monthly bar chart.
- `03_upload_ocr.png` - Drag-and-drop document upload with OCR extraction preview.
- `04_validation_modal.png` - Interactive validation report showing passed rules and errors.
- `05_land_records_table.png` - Searchable, filterable land records table.
- `06_record_details.png` - Complete land record dossier with attached deed preview.
- `07_admin_panel.png` - Administrative approvals queue and user management.
- `08_system_monitoring.png` - Live DevOps monitoring dashboard with container health.

### 2. `screenshots/docker/`
Save terminal screenshots of Docker and Docker Compose execution:
- `docker_compose_build.png` - Running `docker compose up -d --build`.
- `docker_ps_healthy.png` - Running `docker compose ps` showing all 4 services healthy.
- `docker_logs.png` - Output of `docker compose logs`.

### 3. `screenshots/kubernetes/`
Save terminal screenshots of Kubernetes Minikube commands:
- `k8s_deployments.png` - `kubectl get deployments`.
- `k8s_pods.png` - `kubectl get pods -o wide`.
- `k8s_services.png` - `kubectl get svc`.
- `minikube_status.png` - `minikube status`.

### 4. `screenshots/jenkins/`
Save screenshots of the Jenkins CI/CD automation pipeline:
- `jenkins_pipeline_stages.png` - Full Jenkins declarative pipeline stage view (7 green stages).
- `jenkins_console_output.png` - Successful build console output.

### 5. `screenshots/cloud/`
Save AWS Management Console and cloud access screenshots:
- `aws_ec2_instances.png` - AWS EC2 dashboard showing running instance.
- `aws_security_groups.png` - Inbound security group rules (Port 80, 443, 22).
- `aws_browser_public_ip.png` - Accessing the portal via public EC2 IP.

### 6. `screenshots/virtualbox/`
Save Oracle VirtualBox screenshots:
- `virtualbox_vm_settings.png` - VM hardware sizing and bridged network adapter.
- `virtualbox_running.png` - Ubuntu VM terminal running the application.

### 7. `screenshots/ubuntu/`
Save native Ubuntu Linux terminal screenshots:
- `ubuntu_neofetch.png` - System info (`uname -a`, `df -h`, `free -m`).
- `ubuntu_tesseract_test.png` - Running `tesseract --version`.
- `ubuntu_health_check.png` - Running `./scripts/health-check.sh`.
