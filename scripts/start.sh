#!/bin/sh
echo "Syncing database schema..."
npx prisma db push --accept-data-loss 2>/dev/null || echo "DB sync skipped"
echo "Starting server..."
exec node server.js

