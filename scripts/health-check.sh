#!/usr/bin/env bash
# Automated Health Check Probe Script
set -e

echo "================================================================="
echo "   Intelligent Land Record Digitization - System Health Probe   "
echo "================================================================="

# 1. Probe Backend API
echo -n "[1/4] Probing Backend API (http://localhost:8000/health)... "
BACKEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "Failed")
if [ "$BACKEND_STATUS" = "200" ]; then
    echo "ONLINE (HTTP 200)"
else
    echo "STATUS: $BACKEND_STATUS"
fi

# 2. Probe OCR Microservice
echo -n "[2/4] Probing OCR Microservice (http://localhost:8001/health)... "
OCR_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8001/health || echo "Failed")
if [ "$OCR_STATUS" = "200" ]; then
    echo "ONLINE (HTTP 200)"
else
    echo "STATUS: $OCR_STATUS"
fi

# 3. Probe Frontend Client
echo -n "[3/4] Probing Frontend Portal (http://localhost:3000)... "
FRONT_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "Failed")
if [ "$FRONT_STATUS" = "200" ]; then
    echo "ONLINE (HTTP 200)"
else
    echo "STATUS: $FRONT_STATUS"
fi

# 4. Probe Backend Live Diagnostic Payload
echo ""
echo "[4/4] Live Diagnostic JSON Response:"
curl -s http://localhost:8000/health | python3 -m json.tool || curl -s http://localhost:8000/health || echo "API offline."
echo ""
echo "================================================================="
