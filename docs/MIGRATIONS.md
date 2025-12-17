# Database Migrations Guide

## How It Works

Prisma uses a versioned migration system: each schema change generates a SQL file in `prisma/migrations/` that gets applied in order.

**Development:** You create and apply migrations locally  
**Production:** Migrations are applied automatically on every deploy

## Initial Setup (First Time)

**IMPORTANT:** You must create the first migration before the first deploy:

```bash
# 1. Start local PostgreSQL
docker-compose up -d db

# 2. DATABASE_URL should already be in .env
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"

# 3. Create initial migration from your current schema
bun run db:migrate -- --name init
```

This creates `prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql` with your current schema.

**Commit and push** these files before the first deploy to Render.

## Normal Workflow

### Local Development

When you modify `prisma/schema.prisma`:

```bash
# Creates migration and applies it automatically to your local DB
bun run db:migrate
```

This:
1. Creates a SQL file in `prisma/migrations/`
2. Applies migration to your local DB
3. Regenerates Prisma client

### Production (Render.com)

**Migrations are applied automatically** when Render deploys:

1. Render builds Docker
2. Dockerfile `CMD` runs: `prisma migrate deploy`
3. This applies all pending migrations (only new ones)
4. Then starts the server

**You don't need to do anything manually** - each deploy applies migrations automatically.

## Changing Schema (Complete Flow)

1. **Modify** `prisma/schema.prisma`
2. **Run** `bun run db:migrate` (locally) - Prisma will ask for a descriptive name
3. **Verify** migration works locally
4. **Commit** changes (including `prisma/migrations/`)
5. **Push** to GitHub
6. **Render deploys automatically** and applies migration

**Practical example:**

```bash
# You change schema.prisma to add a new field
# Then:
bun run db:migrate
# Prisma asks: "Enter a name for the new migration:"
# You answer: "add_user_email_field"
# Prisma creates: prisma/migrations/20240101120000_add_user_email_field/migration.sql

git add prisma/
git commit -m "Add user email field"
git push
# Render deploys and applies migration automatically
```

## Check Migration Status

```bash
# See which migrations are applied
bunx prisma migrate status
```

## Rollback (If Needed)

Prisma doesn't have automatic rollback. If you need to revert:

1. Modify schema to return to previous state
2. Create a new migration: `bun run db:migrate`
3. Or restore from database backup

## Seed Data

To populate initial data in production:

```bash
# Get DATABASE_URL from Render dashboard
export DATABASE_URL="postgresql://..."

# Run seed
bun run db:seed
```

## Cleaning Data

There are two professional ways to delete data:

### Option 1: Clean Data Only (Recommended)

Deletes all data but keeps the schema intact:

```bash
bun run db:clean
```

This:
- Deletes all Calls and Loads
- Keeps the database schema and migrations
- Uses transactions for safety
- Perfect for resetting test data without losing migrations

### Option 2: Full Reset

Completely resets the database (schema + data):

```bash
bun run db:reset
```

This:
- Drops all tables
- Reapplies all migrations from scratch
- Runs seed automatically after reset
- Use when you want a completely fresh start

**When to use each:**
- `db:clean`: When you just want fresh data, schema is fine
- `db:reset`: When you've changed migrations and want to test from scratch

## Summary

- **Development:** `bun run db:migrate` (creates and applies)
- **Production:** Automatic on every deploy (`prisma migrate deploy`)
- **Schema changes:** Modify `schema.prisma` → migrate → commit → push → automatic deploy
- **Clean data:** `bun run db:clean` (keeps schema) or `bun run db:reset` (full reset)
