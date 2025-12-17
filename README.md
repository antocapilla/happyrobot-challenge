# HappyRobot Challenge - Inbound Carrier Sales

## Stack
- Next.js 16 + TypeScript + Prisma
- PostgreSQL (Fly.io)
- Docker

## Deploy

### Render.com (Recomendado - Más simple)

1. Conectar repo en [Render.com](https://render.com)
2. Crear Blueprint desde `render.yaml` (o crear Web Service + PostgreSQL manualmente)
3. Configurar variable `API_KEY` en el dashboard
4. Deploy automático en cada push

Ver [DEPLOY.md](./DEPLOY.md) para detalles.

### Alternativa: Docker Compose (local)

```bash
docker-compose up -d
```

## Seed (datos demo)

```bash
fly ssh console --app happyrobot-acapilla -C "npx tsx prisma/seed.ts"
```

## URLs

- App: https://happyrobot-acapilla.fly.dev
- API Key: `happyrobot-api-key`

## Desarrollo local

```bash
docker-compose up -d
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"' > .env
echo 'API_KEY="happyrobot-api-key"' >> .env
npm install
npx prisma db push
npm run db:seed
npm run dev
```

## API

Header: `Authorization: Bearer happyrobot-api-key`

| Endpoint | Descripcion |
|----------|-------------|
| POST /api/verify-mc | Verifica MC |
| POST /api/loads/search | Busca cargas |
| GET /api/loads/list | Lista cargas |
| POST /api/pricing/evaluate | Evalua oferta |
| POST /api/calls/ingest | Guarda llamada |
| GET /api/calls/list | Lista llamadas |
