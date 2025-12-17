# HappyRobot Challenge - Inbound Carrier Sales

## Stack

- Next.js 16 + TypeScript + Prisma
- PostgreSQL
- Docker

## Initial Setup

```bash
# 1. Start PostgreSQL
docker-compose up -d db

# 2. Create .env file
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"' > .env
echo 'API_KEY="happyrobot-api-key"' >> .env

# 3. Install dependencies
bun install

# 4. Create initial migration
bun run db:migrate -- --name init

# 5. (Optional) Seed test data
bun run db:seed
```

**Important:** After step 4, commit and push the `prisma/migrations/` folder.

## Local Development

**Option 1: Docker Compose (same as production)**
```bash
docker-compose up --build
# App available at http://localhost:3000
```

**Option 2: Database only + Bun dev (faster for development)**
```bash
docker-compose up -d db
bun run dev
```

## Deployment

### Render.com (Recommended)

1. Connect your repo at [Render.com](https://render.com)
2. Create Blueprint from `render.yaml`
3. Configure `API_KEY` variable in dashboard
4. Automatic deploy on every push

See [docs/DEPLOY.md](./docs/DEPLOY.md) for details.

## API

Header: `X-API-Key: happyrobot-api-key`

| Endpoint | Description |
|----------|-------------|
| POST /api/verify-mc | Verify MC number |
| GET /api/loads/search | Search loads |
| GET /api/loads/list | List loads |
| POST /api/pricing/evaluate | Evaluate pricing offer |
| POST /api/calls/ingest | Save call |
| GET /api/calls/list | List calls |
