# HappyRobot Challenge - Inbound Carrier Sales

## Stack
- Next.js 16 + TypeScript + Prisma
- PostgreSQL
- Railway (deploy automatico)

## Deploy (5 minutos, todo automatico)

### 1. Railway

1. Ve a [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Selecciona "Deploy from GitHub repo"
4. Conecta tu repositorio

### 2. Agregar PostgreSQL

1. En el proyecto, click "New" > "Database" > "PostgreSQL"
2. Railway configura DATABASE_URL automaticamente

### 3. Agregar API Key

1. Click en tu servicio (el que tiene el codigo)
2. Ve a "Variables"
3. Agrega: `API_KEY` = `happyrobot-api-key`

### 4. Deploy automatico

Railway despliega automaticamente en cada push a main.

### 5. Sync DB y Seed (una vez)

En Railway, ve a tu servicio > "Shell" y ejecuta:
```bash
npx prisma db push
npx tsx prisma/seed.ts
```

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
| POST /api/verify-mc | Verifica MC con FMCSA |
| POST /api/loads/search | Busca cargas |
| GET /api/loads/list | Lista cargas |
| POST /api/pricing/evaluate | Evalua oferta |
| POST /api/calls/ingest | Guarda llamada |
| GET /api/calls/list | Lista llamadas |
