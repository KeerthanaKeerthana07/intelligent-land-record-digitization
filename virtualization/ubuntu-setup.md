# Ubuntu Linux Server Configuration Guide
## Intelligent Land Record Digitization and Validation System

This document describes the environment configuration for a native or dedicated Ubuntu Server (versions 22.04 LTS or 24.04 LTS) for running both bare-metal and containerized environments.

---

## 1. System Package Updates & Prerequisites

```bash
# Update repositories and upgrade system packages
sudo apt update && sudo apt upgrade -y

# Install build tools, network utilities, and curl
sudo apt install -y \
    curl \
    wget \
    git \
    build-essential \
    software-properties-common \
    apt-transport-https \
    ca-certificates \
    htop \
    net-tools \
    ufw
```

---

## 2. Python 3.11+ Setup

Ubuntu 22.04/24.04 includes Python 3.10 or 3.12. Ensure `python3-pip` and `python3-venv` are installed:

```bash
sudo apt install -y python3-pip python3-venv python3-dev libpq-dev
python3 --version
pip3 --version
```

---

## 3. Node.js 20 LTS & NPM Setup

Install Node.js 20 LTS via the NodeSource repository:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify versions
node -v
npm -v
```

---

## 4. Tesseract OCR Engine Setup

For running the OCR service directly on Ubuntu without Docker:

```bash
# Install Tesseract OCR binary and English language pack
sudo apt install -y tesseract-ocr tesseract-ocr-eng libtesseract-dev

# Verify Tesseract installation
tesseract --version
tesseract --list-langs
# Expected output contains 'eng'
```

---

## 5. PostgreSQL Database Engine Setup (Local/Native)

If testing PostgreSQL natively on Ubuntu outside Docker:

```bash
sudo apt install -y postgresql postgresql-contrib

# Start and enable PostgreSQL service
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Create land_records database and user
sudo -u postgres psql -c "CREATE USER postgres WITH PASSWORD 'postgres';"
sudo -u postgres psql -c "CREATE DATABASE land_records OWNER postgres;"

# Initialize schema from project init.sql
sudo -u postgres psql -d land_records -f database/init.sql
```

---

## 6. Ubuntu Firewall (UFW) Configuration

Configure the Uncomplicated Firewall (UFW) to protect your Ubuntu server:

```bash
# Allow SSH access
sudo ufw allow 22/tcp

# Allow Web Traffic
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow Dev Testing Ports (Optional)
sudo ufw allow 3000/tcp comment 'Frontend Client'
sudo ufw allow 8000/tcp comment 'Backend FastAPI'
sudo ufw allow 8001/tcp comment 'OCR Service'

# Enable the firewall
sudo ufw enable
sudo ufw status verbose
```

---

## 7. System Health Verification Commands

Verify all running services:
```bash
# Check memory and CPU usage
htop

# Check disk space
df -h

# Check listening network sockets
ss -tulpn
```
