#!/bin/bash
set -e

APP_NAME="happyrobot-acapilla"
DB_NAME="happyrobot-acapilla-db"
REGION="iad"
API_KEY="happyrobot-api-key"

echo "==> Setup $APP_NAME"

fly auth whoami || { echo "Run: fly auth login"; exit 1; }

# App
echo "[1/5] App..."
fly apps create $APP_NAME --org personal 2>/dev/null || echo "exists"

# Postgres
echo "[2/5] Postgres..."
if ! fly apps list | grep -q "$DB_NAME"; then
    fly postgres create --name $DB_NAME --region $REGION --vm-size shared-cpu-1x --volume-size 1 --initial-cluster-size 1
fi

# Start DB
echo "[3/5] Starting DB..."
DB_MACHINE=$(fly machines list --app $DB_NAME --json 2>/dev/null | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
[ -n "$DB_MACHINE" ] && fly machine start $DB_MACHINE --app $DB_NAME 2>/dev/null || true
sleep 10

# Attach
echo "[4/5] Attach DB..."
fly postgres attach $DB_NAME --app $APP_NAME 2>/dev/null || echo "attached"

# Secrets
echo "[5/5] Secrets..."
fly secrets set API_KEY="$API_KEY" --app $APP_NAME

# Deploy
echo "==> Deploy..."
fly deploy --app $APP_NAME

echo ""
echo "Done! https://$APP_NAME.fly.dev"
echo "API_KEY: $API_KEY"

