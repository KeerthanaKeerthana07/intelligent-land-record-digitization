#!/usr/bin/env bash
# Setup Script for Intelligent Land Record Digitization and Validation System
set -e

echo "================================================================="
echo "   Intelligent Land Record Digitization - Setup & Preflight      "
echo "================================================================="

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# 1. Check prerequisites
echo "[1/4] Checking host runtime dependencies..."
command -v git >/dev/null 2>&1 || { echo >&2 "Error: git is required but not installed."; exit 1; }
command -v node >/dev/null 2>&1 || echo "Notice: node not found on PATH. Local frontend run may require Docker."
command -v python3 >/dev/null 2>&1 || command -v python >/dev/null 2>&1 || echo "Notice: python not found on PATH."

# 2. Setup Environment Variables
echo "[2/4] Setting up environment configuration..."
if [ ! -f "docker/.env" ]; then
    cp docker/.env.example docker/.env
    echo "Created docker/.env from template."
else
    echo "docker/.env already exists."
fi

# 3. Create uploads storage directory
echo "[3/4] Ensuring storage directories exist..."
mkdir -p backend/uploads
mkdir -p ocr-service/uploads

# 4. Optional local dependency installation if npm/python exist
echo "[4/4] Project setup verified successfully."
echo ""
echo "Quick Start Options:"
echo "1. Run with Docker Compose:   ./scripts/start.sh"
echo "2. Run Health Check:          ./scripts/health-check.sh"
echo "3. Stop Services:             ./scripts/stop.sh"
echo "================================================================="
