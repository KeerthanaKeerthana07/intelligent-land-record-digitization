# AWS EC2 Cloud Deployment Guide
## Intelligent Land Record Digitization and Validation System

This guide outlines the end-to-end steps to clone, configure, build, and run the complete multi-container system on an AWS EC2 instance running Ubuntu 24.04/22.04 LTS.

---

## 1. Connect to EC2 Instance

```bash
ssh -i land-records-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## 2. Clone the Repository

Clone your project from GitHub to the `/home/ubuntu` working directory:

```bash
cd /home/ubuntu
git clone https://github.com/<YOUR_GITHUB_ORG_OR_USER>/intelligent-land-record-digitization.git
cd intelligent-land-record-digitization
```

---

## 3. Configure Environment Variables

Create the production `.env` file from the provided example:

```bash
cp docker/.env.example docker/.env
nano docker/.env
```

Review and customize the environment parameters:
```ini
POSTGRES_USER=postgres
POSTGRES_PASSWORD=SecureLandRecordsPassword2026!
POSTGRES_DB=land_records
DATABASE_URL=postgresql://postgres:SecureLandRecordsPassword2026!@database:5432/land_records
JWT_SECRET_KEY=long_random_production_secret_key_change_me
ENVIRONMENT=production
OCR_SERVICE_URL=http://ocr-service:8001/extract
```

Save and exit (`Ctrl + O`, `Enter`, `Ctrl + X`).

---

## 4. Build and Start Multi-Container Services

Run Docker Compose to build the 3 application images and download PostgreSQL:

```bash
# Build and launch all 4 services in detached mode
docker compose -f docker/docker-compose.yml up -d --build
```

### Verify Container Health
```bash
# Check status of all containers
docker compose -f docker/docker-compose.yml ps

# Expected output:
# NAME                   IMAGE                                        STATUS                   PORTS
# land_records_db        postgres:16-alpine                           Up (healthy)             0.0.0.0:5432->5432/tcp
# land_records_ocr       intelligent-land-record-digitization-ocr     Up (healthy)             0.0.0.0:8001->8001/tcp
# land_records_backend   intelligent-land-record-digitization-backend Up (healthy)             0.0.0.0:8000->8000/tcp
# land_records_frontend  intelligent-land-record-digitization-front   Up (healthy)             0.0.0.0:3000->80/tcp
```

### Inspect Container Logs
```bash
# Stream logs across all services
docker compose -f docker/docker-compose.yml logs -f

# Check backend logs specifically
docker compose -f docker/docker-compose.yml logs -f backend

# Check OCR microservice logs
docker compose -f docker/docker-compose.yml logs -f ocr-service
```

---

## 5. Accessing the Application

Open your browser and navigate to:
- **Frontend Portal**: `http://<EC2_PUBLIC_IP>:3000` (or `http://<EC2_PUBLIC_IP>` if mapped to port 80).
- **Backend API Docs (Swagger UI)**: `http://<EC2_PUBLIC_IP>:8000/docs`
- **System Health Endpoint**: `http://<EC2_PUBLIC_IP>:8000/health`
- **OCR Microservice Health**: `http://<EC2_PUBLIC_IP>:8001/health`

### Demo Login Credentials
- **Administrator**: `admin@landrecords.gov.in` / `admin123`
- **Revenue Officer**: `officer@landrecords.gov.in` / `officer123`

---

## 6. Configuring Production HTTPS with Let's Encrypt (SSL/TLS)

For a real government domain (e.g., `landrecords.example.com`), secure HTTP traffic using **Certbot** and **Let's Encrypt**:

### Step 6.1: Point DNS A Record to EC2 Elastic IP
In Route 53 or your DNS registrar, create an `A` record pointing `landrecords.example.com` to `<EC2_PUBLIC_IP>`.

### Step 6.2: Install Certbot on Ubuntu
```bash
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### Step 6.3: Generate Free SSL Certificate
Stop the frontend container temporarily to release port 80:
```bash
docker compose -f docker/docker-compose.yml stop frontend

sudo certbot certonly --standalone -d landrecords.example.com
```

Certificates will be saved to `/etc/letsencrypt/live/landrecords.example.com/fullchain.pem`.

### Step 6.4: Mount SSL Certificates to Nginx in Docker Compose
Update `docker/docker-compose.yml` to mount the certificate folder into Nginx:
```yaml
frontend:
  ports:
    - "80:80"
    - "443:443"
  volumes:
    - /etc/letsencrypt:/etc/letsencrypt:ro
```
Restart with `docker compose -f docker/docker-compose.yml up -d`.

---

## 7. Useful Management Commands

```bash
# Restart all containers
docker compose -f docker/docker-compose.yml restart

# Stop all containers
docker compose -f docker/docker-compose.yml stop

# Destroy containers (volumes retained)
docker compose -f docker/docker-compose.yml down

# Destroy containers and remove data volumes (CAUTION: clears database)
docker compose -f docker/docker-compose.yml down -v
```
