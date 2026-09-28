#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git pull --ff-only

docker compose --profile edore-backend up -d --build postgres redis qdrant backend

echo "Waiting for backend health..."
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${BACKEND_PORT:-8080}/actuator/health" >/dev/null; then
    curl -s "http://127.0.0.1:${BACKEND_PORT:-8080}/actuator/health"
    echo
    docker compose --profile edore-backend ps
    exit 0
  fi
  sleep 2
done

echo "Backend health check failed"
docker compose --profile edore-backend logs --tail=80 backend
exit 1
