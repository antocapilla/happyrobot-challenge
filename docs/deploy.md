# Deployment Guide

This guide explains how to deploy the application to production.

## Prerequisites

- GitHub repository with the code
- Render.com account (or your preferred hosting provider)
- Docker installed locally (for testing)

## Render.com Deployment

Render.com is recommended because it provides automatic deployments and database hosting.

### Initial Setup

1. **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect repository to Render**
   - Go to [Render.com](https://render.com) and sign in
   - Click "New +" → "Blueprint"
   - Select your GitHub repository
   - Render will detect `render.yaml` automatically
   - Click "Apply"

3. **Configure environment variables**
   - In the Render dashboard, open the "happyrobot-app" service
   - Go to "Environment"
   - Add variable:
     - **Key**: `API_KEY`
     - **Value**: Your preferred API key (e.g., `happyrobot-api-key`)
   - Save

4. **Wait for deployment**
   - First deployment takes 5-10 minutes
   - Watch the logs in real-time
   - When finished, you'll get a URL like `https://happyrobot-app.onrender.com`

### Database Migrations

Migrations run automatically on every deploy. The Dockerfile runs `prisma migrate deploy` before starting the server.

**To create migrations locally:**
```bash
docker-compose up -d db
bun run db:migrate -- --name your_migration_name
git add prisma/migrations/
git commit -m "Add migration"
git push
```

**To change the schema:**
1. Modify `prisma/schema.prisma`
2. Run `bun run db:migrate` locally
3. Commit and push changes (including `prisma/migrations/`)
4. Render deploys automatically and runs migrations

### Seed Data (Optional)

To add test data to production:

```bash
# Get DATABASE_URL from Render dashboard (database section)
export DATABASE_URL="postgresql://..."
bun run db:seed
```

**Note:** The database is internal-only by default. Enable external access in Render dashboard if you need to connect from your local machine.

## Docker Deployment

You can deploy using Docker on any platform that supports Docker.

### Build Image

```bash
docker build -t happyrobot-app .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e API_KEY="your-api-key" \
  happyrobot-app
```

### Docker Compose

For local testing that matches production:

```bash
docker-compose up --build
```

This starts both the database and application containers.

## Environment Variables

Required environment variables:

- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - API key for authentication

Optional:
- `NODE_ENV` - Set to `production` in production (defaults to `production` in Docker)

## Health Checks

The application includes health check endpoints:
- `/` - Basic health check
- Database connection is verified on startup

Render automatically uses these for health monitoring.

## Monitoring

- **Logs**: Available in Render dashboard under "Logs"
- **Metrics**: Render provides basic metrics (CPU, memory, requests)
- **Database**: PostgreSQL logs available in Render dashboard

## Troubleshooting

**Application won't start:**
- Check logs in Render dashboard
- Verify `DATABASE_URL` is correct
- Ensure migrations ran successfully

**Database connection errors:**
- Verify `DATABASE_URL` format
- Check database is running and accessible
- Ensure migrations have been applied

**API returns 401 errors:**
- Verify `API_KEY` environment variable is set
- Check API key matches what you're sending in requests

## Rollback

To rollback to a previous version:
1. Go to Render dashboard
2. Open your service
3. Go to "Events" tab
4. Find the previous successful deployment
5. Click "Redeploy"

Or redeploy a specific commit:
1. Go to "Manual Deploy"
2. Select the commit hash
3. Click "Deploy"

