#!/bin/bash
set -e

echo "==> Initializing database..."

# 1. Check if PostgreSQL is running
echo "[1/3] Checking PostgreSQL..."
if ! docker-compose ps db | grep -q "Up"; then
    echo "Starting PostgreSQL..."
    docker-compose up -d db
    echo "Waiting for PostgreSQL to be ready..."
    sleep 5
fi

# 2. Check if migrations already exist
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "[2/3] Migrations exist, applying them..."
    bun run db:migrate:deploy
else
    echo "[2/3] Creating initial migration..."
    bun run db:migrate -- --name init
fi

# 3. Generate Prisma client
echo "[3/3] Generating Prisma client..."
bun run db:generate

echo ""
echo "✅ Database initialized successfully!"
echo ""
echo "To seed test data: bun run db:seed"

