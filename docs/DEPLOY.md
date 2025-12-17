# Deployment Guide - Render.com

## Initial Setup (One Time)

### 1. Push Changes to GitHub

```bash
git add render.yaml docs/DEPLOY.md README.md
git commit -m "Add Render.com deployment config"
git push
```

### 2. Create Account and Connect Repo

1. Go to [Render.com](https://render.com) and create account
2. Connect your GitHub account (if not connected)
3. In dashboard, click **"New +"** → **"Blueprint"**
4. Select your repository `happyrobot-challenge`
5. Render will detect `render.yaml` automatically
6. Click **"Apply"**

### 3. Configure API_KEY

1. In dashboard, open service **"happyrobot-app"**
2. Go to **"Environment"**
3. Add variable:
   - **Key**: `API_KEY`
   - **Value**: `happyrobot-api-key` (or your preferred key)
4. Save

### 4. Wait for Deploy

- Render will build Docker image and deploy
- First deploy may take 5-10 minutes
- You'll see logs in real-time

### 5. Verify

- When finished, you'll see the URL (e.g., `https://happyrobot-app.onrender.com`)
- Test the URL in your browser

## Database Migrations

**Migrations are applied automatically** on every deploy. The Dockerfile runs `prisma migrate deploy` before starting the server.

**To create the first migration (before first deploy):**

```bash
docker-compose up -d db
bun run db:migrate -- --name init
git add prisma/migrations/
git commit -m "Add initial migration"
git push
```

**To change the schema:**

1. Modify `prisma/schema.prisma`
2. Run `bun run db:migrate` (locally)
3. Commit changes (including `prisma/migrations/`)
4. Push → Render deploys automatically

## Seed Data (Optional)

If you need test data:

```bash
# Get DATABASE_URL from Render dashboard (in database section)
# Note: Database is internal-only by default. Enable external access in dashboard if needed.
export DATABASE_URL="postgresql://..." # Copy from Render
bun run db:seed
```

**Database Access:**
- **Internal (default):** Only accessible from Render services (your app). More secure.
- **External:** Can be enabled in Render dashboard if you need to connect from your local machine.

## URLs

- **App**: Generated automatically (e.g., `https://happyrobot-app.onrender.com`)
- **API Key**: The one you configure in environment variables

## Automatic Deploy

Render deploys automatically on every push to `main` (or the branch you configure).
