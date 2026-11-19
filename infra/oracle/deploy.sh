#!/usr/bin/env bash
# Deploy the ClauseLens backend to an Oracle Cloud Always Free VM.
# Usage (on the VM, from this directory):  sudo bash deploy.sh
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Ensuring Docker is installed..."
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
if ! docker compose version >/dev/null 2>&1; then
  apt-get update && apt-get install -y docker-compose-plugin
fi

if [ ! -f .env ]; then
  echo "ERROR: .env not found. Copy .env.example to .env and fill in DOMAIN + your API keys."
  exit 1
fi

mkdir -p data

echo "==> Building and starting services..."
docker compose up -d --build

echo "==> Waiting for API health check..."
for i in $(seq 1 30); do
  if curl -fsS http://localhost:8000/health >/dev/null 2>&1; then
    echo "API is healthy."
    break
  fi
  sleep 5
done

docker compose ps
DOMAIN_VAL=$(grep -E '^DOMAIN=' .env | tail -1 | cut -d= -f2)
echo
echo "Deployed. Public endpoint: https://${DOMAIN_VAL:-yourdomain}"
echo "Verify: curl https://${DOMAIN_VAL:-yourdomain}/health"
