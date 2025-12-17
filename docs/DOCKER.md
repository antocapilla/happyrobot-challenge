# Docker Guide

## Local Development

Run everything the same as production:

```bash
# Build and start everything (database + application)
docker-compose up --build

# In detached mode (background)
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop
docker-compose down

# Reset database (deletes all data)
docker-compose down -v
```

**App available at:** http://localhost:3000

## Fast Development with Hot-Reload

If you only want the database and develop with hot-reload:

```bash
# Start database only
docker-compose up -d db

# Run app with Bun (automatic hot-reload)
bun run dev
```

## Useful Commands

```bash
# Check container status
docker-compose ps

# View logs for specific service
docker-compose logs -f db

# Restart a service
docker-compose restart app

# Rebuild without cache
docker-compose build --no-cache
```

## Production

For production, use Render.com (see [DEPLOY.md](./DEPLOY.md)). The Dockerfile is used automatically on Render.
