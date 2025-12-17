#!/bin/sh

echo "==> Starting application..."

# Run migrations (deploy only, no reset)
echo "[1/2] Running database migrations..."
bunx prisma migrate deploy || {
  echo "⚠️  Migration deploy failed. This might be normal on first deploy."
  echo "   Checking migration status..."
  bunx prisma migrate status || echo "   Could not check migration status."
  echo "   Continuing with server start..."
}

# Start the server
echo "[2/2] Starting Next.js server..."
exec bun server.js

