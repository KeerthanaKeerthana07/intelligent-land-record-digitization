# Oracle VM VirtualBox Setup Guide
## Intelligent Land Record Digitization and Validation System

This guide explains how to install and configure an **Ubuntu Linux Virtual Machine** using **Oracle VM VirtualBox** to simulate an isolated on-premises production server.

---

## 1. Prerequisites
- Download and install [Oracle VM VirtualBox 7.x](https://www.virtualbox.org/).
- Download the official [Ubuntu 24.04 or 22.04 LTS Server / Desktop ISO](https://ubuntu.com/download/server).

---

## 2. Virtual Machine Creation & Resource Allocation

1. Open VirtualBox and click **New**.
2. **Name**: `Ubuntu-LandRecords-Server`
3. **Type**: `Linux`, **Version**: `Ubuntu (64-bit)`.
4. **Hardware Sizing**:
   - **Base Memory (RAM)**: Minimum **4096 MB (4 GB)** recommended; 8192 MB (8 GB) ideal for running Minikube or all containers comfortably.
   - **Processors (vCPU)**: Allocate at least **2 CPUs** (4 CPUs recommended).
   - Check **Enable EFI** (optional).
5. **Virtual Hard Disk**:
   - Size: Allocate at least **35 GB** dynamically allocated VDI disk space.
6. Click **Finish**.

---

## 3. Network Configuration (Bridged vs. NAT)

To allow your host Windows PC to access the website running inside the VirtualBox VM:

### Recommended: Bridged Adapter
1. In VirtualBox, select the VM > **Settings** > **Network**.
2. Under **Adapter 1**, change *Attached to* from `NAT` to **Bridged Adapter**.
3. Select your active Windows Wi-Fi or Ethernet adapter.
4. *Effect:* The VM receives its own dedicated IP address on your local home/college Wi-Fi network (e.g., `192.168.1.150`).

### Alternative: NAT with Port Forwarding
If Bridged networking is blocked on a restricted college Wi-Fi:
1. Keep *Attached to* as **NAT**.
2. Click **Advanced** > **Port Forwarding**.
3. Add the following port forwarding rules:

| Rule Name | Protocol | Host IP | Host Port | Guest IP | Guest Port |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Frontend** | TCP | `127.0.0.1` | `3000` | (leave blank) | `3000` |
| **Backend** | TCP | `127.0.0.1` | `8000` | (leave blank) | `8000` |
| **OCR** | TCP | `127.0.0.1` | `8001` | (leave blank) | `8001` |
| **SSH** | TCP | `127.0.0.1` | `2222` | (leave blank) | `22` |

---

## 4. Ubuntu Installation Steps

1. Attach the Ubuntu ISO to the VM's optical drive under **Storage** settings.
2. Start the VM and choose **Try or Install Ubuntu**.
3. Choose Language: `English`, Keyboard Layout: `English (US)`.
4. Disk partitioning: Use default entire disk.
5. Setup user profile:
   - Your name: `DevOps Student`
   - Server name: `landrecords-server`
   - Username: `devops`
   - Password: Choose a secure password.
6. Check **Install OpenSSH server** during setup.
7. Reboot the VM after installation completes.

---

## 5. Installing Project Dependencies in VirtualBox

Once inside the Ubuntu VM terminal:

```bash
# 1. Update package manager
sudo apt update && sudo apt upgrade -y

# 2. Install Git and Docker
sudo apt install -y git curl docker.io docker-compose-v2
sudo usermod -aG docker $USER
newgrp docker

# 3. Clone the Project
git clone https://github.com/<YOUR_REPO>/intelligent-land-record-digitization.git
cd intelligent-land-record-digitization

# 4. Start all services
docker compose -f docker/docker-compose.yml up -d --build
```

---

## 6. Accessing the Website from Host Windows

Find the VM's IP address:
```bash
ip addr show | grep "inet "
# e.g., 192.168.1.150
```

From your Windows browser:
- **Frontend Portal**: `http://192.168.1.150:3000`
- **Backend Swagger API**: `http://192.168.1.150:8000/docs`
- **System Health**: `http://192.168.1.150:8000/health`
