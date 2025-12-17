# HappyRobot Challenge - Inbound Carrier Sales

## Stack
- Next.js 16 + TypeScript + Prisma
- PostgreSQL
- Docker

## Setup Inicial (Primera Vez)

```bash
# 1. Levantar PostgreSQL
docker-compose up -d db

# 2. Crear archivo .env
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"' > .env
echo 'API_KEY="happyrobot-api-key"' >> .env

# 3. Instalar dependencias
bun install

# 4. Crear migración inicial
bun run db:migrate -- --name init

# 5. (Opcional) Poblar datos de prueba
bun run db:seed
```

**IMPORTANTE**: Después del paso 3, commit y push la carpeta `prisma/migrations/`.

## Desarrollo Local

**Opción 1: Docker Compose (igual que producción)**
```bash
docker-compose up --build
# App en http://localhost:3000
```

**Opción 2: Solo BD + Bun dev (más rápido para desarrollo)**
```bash
docker-compose up -d db
bun run dev
```

## Deploy

### Render.com (Recomendado)

1. Conectar repo en [Render.com](https://render.com)
2. Crear Blueprint desde `render.yaml`
3. Configurar variable `API_KEY` en el dashboard
4. Deploy automático en cada push

Ver [docs/DEPLOY.md](./docs/DEPLOY.md) para detalles.


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
