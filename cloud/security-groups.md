# AWS Security Groups Configuration Guide
## Intelligent Land Record Digitization and Validation System

Security Groups act as a virtual firewall for your EC2 instances to control incoming and outgoing network traffic. This document details the inbound and outbound security rules required for a production-ready deployment.

---

## 1. Security Architecture Principles

```
  Internet Clients
         │
         ▼ (Port 80 / 443)
┌────────────────────────────────────────────────────────┐
│ EC2 Instance Security Group: `land-records-prod-sg`    │
│                                                        │
│  ┌─────────────────┐                                  │
│  │ Frontend Nginx  │ (Port 80 / 3000)                 │
│  └────────┬────────┘                                  │
│           │ Internal Docker Bridge Network (`land_record_network`)
│           ▼ (Port 8000)                               │
│  ┌─────────────────┐      (Port 8001)                 │
│  │  FastAPI API    │ ────────────────► ┌────────────┐ │
│  └────────┬────────┘                   │ OCR Engine │ │
│           │                            └────────────┘ │
│           ▼ (Port 5432 - INTERNAL ONLY)               │
│  ┌──────────────────────────────────────────────────┐ │
│  │ PostgreSQL Database (NEVER EXPOSED TO INTERNET)  │ │
│  └──────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────┘
```

> [!CAUTION]
> **CRITICAL SECURITY RULE:** NEVER open port `5432` (PostgreSQL) to `0.0.0.0/0` (the public internet). PostgreSQL must only communicate over the private internal Docker bridge network (`land_record_network`). Exposing port 5432 invites automated brute-force attacks and SQL credential compromise.

---

## 2. Inbound Rules Table

Create an AWS Security Group named `land-records-prod-sg` with the following inbound rules:

| Type | Protocol | Port Range | Source | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **SSH** | TCP | `22` | `My IP` (or `0.0.0.0/0`) | Secure remote terminal access via `.pem` key |
| **HTTP** | TCP | `80` | `0.0.0.0/0` | Public citizen/officer web traffic (Nginx) |
| **HTTPS** | TCP | `443` | `0.0.0.0/0` | Secure SSL/TLS encrypted traffic (Let's Encrypt) |
| **Custom TCP** | TCP | `3000` | `0.0.0.0/0` | Direct Vite frontend container access (Testing) |
| **Custom TCP** | TCP | `8000` | `0.0.0.0/0` | FastAPI Swagger documentation `/docs` (Testing) |

---

## 3. Outbound Rules Table

Outbound traffic allows the EC2 instance to pull Docker images from Docker Hub, download Ubuntu security patches, and interact with external NTP/DNS servers:

| Type | Protocol | Port Range | Destination | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **All Traffic** | ALL | `0 - 65535` | `0.0.0.0/0` | Outbound package downloads & Docker Hub access |

---

## 4. Configuring via AWS CLI

You can create and attach this Security Group directly using the AWS CLI:

```bash
# 1. Create the Security Group
SG_ID=$(aws ec2 create-security-group \
  --group-name "land-records-prod-sg" \
  --description "Security group for Intelligent Land Record System" \
  --query 'GroupId' \
  --output text)

echo "Created Security Group ID: $SG_ID"

# 2. Add SSH Rule (Restrict to your current IP)
MY_IP=$(curl -s https://checkip.amazonaws.com)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 22 \
  --cidr "$MY_IP/32"

# 3. Add HTTP (80) & HTTPS (443) Rules
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 80 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 443 \
  --cidr 0.0.0.0/0

# 4. Add Port 3000 (Frontend) & Port 8000 (Backend API / Docs)
aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 3000 \
  --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress \
  --group-id $SG_ID \
  --protocol tcp \
  --port 8000 \
  --cidr 0.0.0.0/0
```

---

## 5. Security Best Practices
1. **Restrict SSH:** Limit port 22 to your team's static IP or college subnet instead of `0.0.0.0/0`.
2. **Reverse Proxy:** Direct all external traffic through port 80/443 (Nginx) so that backend and OCR microservices are shielded behind the reverse proxy.
3. **Database Isolation:** Database port 5432 is strictly kept within the internal Docker network.
