#!/usr/bin/env bash
# Start all 4 containers with Docker Compose
set -e

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

echo "================================================================="
echo " Starting Intelligent Land Record Digitization Services (Docker) "
echo "================================================================="

if [ ! -f "docker/.env" ]; then
    echo "Creating docker/.env from docker/.env.example..."
    cp docker/.env.example docker/.env
fi

echo "Building and launching containers in detached mode..."
docker compose -f docker/docker-compose.yml up -d --build

echo ""
echo "Waiting for services to become healthy..."
sleep 5

docker compose -f docker/docker-compose.yml ps

echo ""
echo "================================================================="
echo " Services are running!"
echo "   Frontend Portal:        http://localhost:3000"
echo "   Backend REST API:       http://localhost:8000"
echo "   Interactive API Docs:   http://localhost:8000/docs"
echo "   OCR Microservice:       http://localhost:8001"
echo "   Health Endpoint:        http://localhost:8000/health"
echo ""
echo " Demo Accounts:"
echo "   Admin:   admin@landrecords.gov.in   / admin123"
echo "   Officer: officer@landrecords.gov.in / officer123"
echo "================================================================="
