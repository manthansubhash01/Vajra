#!/usr/bin/env bash
set -euo pipefail

REPO_DIR="${REPO_DIR:-.}"
FRONTEND_API_URL="${FRONTEND_API_URL:-http://localhost:5000}"

cd "$REPO_DIR"

PREVIOUS_COMMIT=$(git rev-parse HEAD^)

docker rm -f vajra-backend vajra-frontend >/dev/null 2>&1 || true

git reset --hard "$PREVIOUS_COMMIT"

docker build -t vajra-backend ./server
docker run -d --name vajra-backend --restart unless-stopped \
  -e PORT=5000 \
  -p 5000:5000 vajra-backend

docker build -t vajra-frontend ./client
docker run -d --name vajra-frontend --restart unless-stopped \
  -e VITE_API_URL="$FRONTEND_API_URL" \
  -p 5173:5173 vajra-frontend

for _ in {1..12}; do
  curl -sf http://localhost:5000/api/health >/dev/null && break
  sleep 5
done

for _ in {1..12}; do
  curl -sf http://localhost:5173 >/dev/null && break
  sleep 5
done

curl -sf http://localhost:5000/api/health >/dev/null
curl -sf http://localhost:5173 >/dev/null
echo "Rolled back to commit: $PREVIOUS_COMMIT"
