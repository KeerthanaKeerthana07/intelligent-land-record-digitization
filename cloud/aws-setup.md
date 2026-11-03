# AWS EC2 Cloud Infrastructure Setup Guide
## Intelligent Land Record Digitization and Validation System

This guide provides instructions for provisioning and configuring an **AWS EC2 Ubuntu Instance** to host the four containerized services (Frontend, Backend, OCR Service, and PostgreSQL Database).

---

## 1. Prerequisites
- An active AWS Account.
- AWS Management Console access or AWS CLI configured (`aws configure`).
- An SSH Key Pair (e.g., `land-records-key.pem`).

---

## 2. Recommended EC2 Instance Sizing

Because the **Tesseract OCR engine** and **PostgreSQL** require processing power for document image thresholding and indexing, the following instance specifications are recommended:

| Parameter | Recommended Specification | Minimum Specification |
| :--- | :--- | :--- |
| **Instance Type** | `t3.medium` (2 vCPU, 4 GiB RAM) | `t2.small` (1 vCPU, 2 GiB RAM) |
| **Operating System** | Ubuntu Server 24.04 LTS (HVM) | Ubuntu Server 22.04 LTS |
| **Architecture** | 64-bit (x86) | 64-bit (x86) |
| **Storage (EBS)** | 30 GiB General Purpose SSD (`gp3`) | 20 GiB (`gp3`) |
| **Elastic IP** | 1 Allocated Static Public IPv4 | Dynamic Public IPv4 |

---

## 3. Step-by-Step EC2 Instance Launch

### Step 3.1: Launch Instance in AWS Console
1. Navigate to **EC2 Dashboard** > **Instances** > Click **Launch Instances**.
2. **Name**: `intelligent-land-record-prod`.
3. **Application and OS Images (AMI)**: Choose **Ubuntu Server 24.04 LTS**.
4. **Instance Type**: Select `t3.medium`.
5. **Key Pair**: Select your existing `.pem` key or create `land-records-key.pem`.
6. **Network Settings**:
   - Check **Allow SSH traffic from Anywhere** (or restrict to your college/home IP for security).
   - Check **Allow HTTP traffic from the internet** (Port 80).
   - Check **Allow HTTPS traffic from the internet** (Port 443).
   - (Custom Security Group configuration is detailed in `cloud/security-groups.md`).
7. **Configure Storage**: Set size to **30 GiB** `gp3`.
8. Click **Launch Instance**.

---

## 4. Connecting to the Ubuntu Instance

Set appropriate permissions on your private key:
```bash
chmod 400 land-records-key.pem
```

Connect via SSH:
```bash
ssh -i land-records-key.pem ubuntu@<YOUR_EC2_PUBLIC_IP>
```

---

## 5. System Update & Docker Installation

Run the following commands on the freshly launched Ubuntu EC2 instance:

```bash
# 1. Update package lists and upgrade system packages
sudo apt update && sudo apt upgrade -y

# 2. Install essential utilities and tools
sudo apt install -y curl wget git htop unzip ca-certificates gnupg lsb-release

# 3. Add official Docker GPG key
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

# 4. Set up Docker repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# 5. Install Docker Engine and Docker Compose Plugin
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# 6. Enable Docker service on system boot
sudo systemctl enable docker
sudo systemctl start docker

# 7. Grant the 'ubuntu' user permissions to run docker without sudo
sudo usermod -aG docker ubuntu
newgrp docker

# 8. Verify Docker installation
docker --version
docker compose version
```

---

## 6. Swap Memory Configuration (Optional for 2GB instances)
If deploying on a smaller instance (`t2.small`), allocate 2GB swap memory to prevent Out-Of-Memory (OOM) during OCR scanning:

```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
free -h
```

---

## 7. Next Steps
- Configure AWS Security Groups: Refer to [`cloud/security-groups.md`](./security-groups.md).
- Deploy with Docker Compose: Refer to [`cloud/deployment-guide.md`](./deployment-guide.md).
