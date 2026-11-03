# Windows Subsystem for Linux (WSL 2) Setup Guide
## Intelligent Land Record Digitization and Validation System

This guide provides instructions for configuring **Ubuntu on Windows using WSL 2** to run the project in a native Linux environment with full Docker integration.

---

## 1. Enabling WSL 2 on Windows 10 / 11

Open **PowerShell as Administrator** on your Windows PC and execute:

```powershell
# 1. Install WSL with the default Ubuntu distribution
wsl --install -d Ubuntu

# 2. Check installed WSL status and kernel version
wsl --status

# 3. Ensure WSL default version is set to 2
wsl --set-default-version 2
```

Restart your computer if prompted.

---

## 2. Initializing Ubuntu in WSL

1. Launch **Ubuntu** from the Windows Start Menu or run `wsl` in Windows Terminal.
2. Create your default UNIX username and password when prompted (e.g., `devops_user`).

### Update Packages
Inside your Ubuntu terminal:
```bash
sudo apt update && sudo apt upgrade -y
```

### Install Essential Packages & Git
```bash
sudo apt install -y git curl wget build-essential python3 python3-pip python3-venv nodejs npm
```

Verify Git:
```bash
git --version
# Expected: git version 2.43.0 or higher
```

---

## 3. Navigating Directories in WSL

In WSL, your Windows local drives (such as `C:` or `D:`) are mounted automatically under `/mnt/`:

| Windows Path | WSL 2 Linux Path |
| :--- | :--- |
| `C:\Users\<username>` | `/mnt/c/Users/<username>` |
| `D:\intelligent-land-record-digitization` | `/mnt/d/intelligent-land-record-digitization` |

To navigate to the project directory:
```bash
cd /mnt/d/intelligent-land-record-digitization
ls -la
```

---

## 4. Docker Integration with WSL 2

There are two primary ways to run Docker in WSL:

### Option A: Using Docker Desktop (Recommended for Windows)
1. Open **Docker Desktop Settings** on Windows.
2. Navigate to **General** > Ensure **Use the WSL 2 based engine** is checked.
3. Navigate to **Resources** > **WSL Integration**.
4. Enable integration with your **Ubuntu** distribution and click **Apply & Restart**.
5. Test from your WSL terminal:
   ```bash
   docker ps
   docker compose version
   ```

### Option B: Native Docker Engine inside WSL (No Docker Desktop needed)
```bash
sudo apt update
sudo apt install -y docker.io docker-compose-v2
sudo usermod -aG docker $USER
sudo service docker start
docker ps
```

---

## 5. Running the Project in WSL 2

From the project root inside WSL:

```bash
cd /mnt/d/intelligent-land-record-digitization

# Run the project with Docker Compose
docker compose -f docker/docker-compose.yml up -d --build

# View logs
docker compose -f docker/docker-compose.yml logs -f

# Verify running services
docker compose -f docker/docker-compose.yml ps
```

Access the frontend from your Windows web browser at:
`http://localhost:3000`
