#!/usr/bin/env bash
# Stop all Docker Compose services
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "================================================================="
echo " Stopping Intelligent Land Record Digitization Services          "
echo "================================================================="

docker compose -f docker/docker-compose.yml down

echo "Containers successfully stopped and networks cleared."
echo "Note: PostgreSQL data volume (land_records_pgdata) is preserved."
