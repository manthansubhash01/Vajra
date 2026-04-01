#!/usr/bin/env bash
set -euo pipefail

for var in EC2_HOST EC2_USER EC2_SSH_KEY; do
  if [ -z "${!var:-}" ]; then
    echo "Missing required environment variable: $var" >&2
    exit 1
  fi
done

DEPLOY_PATH="${DEPLOY_PATH:-/opt/vajra}"
GIT_COMMIT="${GIT_COMMIT:-main}"
FRONTEND_API_URL="${FRONTEND_API_URL:-http://${EC2_HOST}:5000}"

SSH_DIR="${HOME}/.ssh"
KEY_FILE="${SSH_DIR}/vajra_deploy_key"

mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

trap 'rm -f "$KEY_FILE"' EXIT

printf '%s\n' "$EC2_SSH_KEY" > "$KEY_FILE"
chmod 600 "$KEY_FILE"

ssh-keyscan -H "$EC2_HOST" >> "$SSH_DIR/known_hosts" 2>/dev/null || true

remote_command="cd \"$DEPLOY_PATH\" && GIT_COMMIT=\"$GIT_COMMIT\" FRONTEND_API_URL=\"$FRONTEND_API_URL\" bash scripts/deploy/deploy.sh"

ssh -i "$KEY_FILE" "$EC2_USER@$EC2_HOST" "$remote_command"