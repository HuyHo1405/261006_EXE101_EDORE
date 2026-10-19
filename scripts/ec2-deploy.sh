#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git fetch origin main
git reset --hard origin/main

docker compose --profile edore-backend up -d postgres redis qdrant

echo "Waiting for PostgreSQL before importing the question bank..."
postgres_ready=false
for i in $(seq 1 30); do
  if docker compose --profile edore-backend exec -T postgres sh -c 'pg_isready --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"' >/dev/null 2>&1; then
    postgres_ready=true
    break
  fi
  sleep 2
done
if [ "$postgres_ready" != true ]; then
  echo "PostgreSQL readiness check failed"
  exit 1
fi

# Transactional upsert; abort deployment if lesson codes are missing or ambiguous.
docker compose --profile edore-backend exec -T postgres sh -c \
  'exec psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB"' \
  < java-backend/lesson-questions-generated.sql

docker compose --profile edore-backend up -d --build backend

echo "Waiting for backend health..."
for i in $(seq 1 50); do
  if curl -fsS "http://127.0.0.1:${BACKEND_PORT:-8080}/actuator/health" >/dev/null; then
    curl -s "http://127.0.0.1:${BACKEND_PORT:-8080}/actuator/health"
    echo
    docker compose --profile edore-backend ps
    exit 0
  fi
  sleep 2
done

echo "Backend health check failed"
docker compose --profile edore-backend logs --tail=200 backend
exit 1
