# HappyRobot Challenge - Inbound Carrier Sales

Sistema de automatizacion de llamadas entrantes de transportistas para brokers de carga.

## Stack Tecnologico

| Componente | Tecnologia | Justificacion |
|------------|------------|---------------|
| Frontend/Backend | Next.js 16 | Framework full-stack, API routes integradas, SSR |
| Lenguaje | TypeScript | Tipado estatico, mejor DX y menos errores |
| Base de datos | PostgreSQL | DB relacional robusta, ideal para datos estructurados |
| ORM | Prisma | Type-safe, migraciones, excelente DX |
| UI | Tailwind + shadcn/ui | Componentes accesibles, estilos consistentes |
| Validacion | Zod | Validacion de schemas en runtime |
| Deploy | Railway | CI/CD automatico, PostgreSQL integrado, simple |
| Contenedor | Docker | Portabilidad, builds reproducibles |

## Arquitectura

```
src/
  app/
    api/              # API Routes
      verify-mc/      # Verificacion FMCSA
      loads/          # Busqueda y listado de cargas
      pricing/        # Evaluacion de ofertas
      calls/          # Gestion de llamadas
    page.tsx          # Dashboard
  features/           # Logica de negocio por dominio
  components/         # Componentes UI
  lib/                # Utilidades compartidas
prisma/
  schema.prisma       # Modelo de datos
  seed.ts             # Datos de ejemplo
```

## Deploy en Railway

### Por que Railway

- PostgreSQL integrado que no se suspende
- CI/CD automatico desde GitHub
- Variables de entorno desde dashboard
- HTTPS automatico
- Pricing predecible

### Pasos

1. Ve a [railway.app](https://railway.app)
2. "New Project" > "Deploy from GitHub repo"
3. Selecciona el repositorio
4. Agrega PostgreSQL: "New" > "Database" > "PostgreSQL"
5. En tu servicio, agrega variable: `API_KEY` = `happyrobot-api-key`
6. Espera el deploy (las tablas se crean automaticamente)
7. Para datos demo, en "Shell" ejecuta:
   ```bash
   npx tsx prisma/seed.ts
   ```

Cada push a `main` despliega automaticamente.

### Ver URL del deploy

1. En Railway, click en tu servicio
2. Settings > Networking > Public Networking
3. Click "Generate Domain"

URL tipo: `https://tu-proyecto.up.railway.app`

## Desarrollo Local

```bash
# 1. Levantar PostgreSQL
docker-compose up -d

# 2. Configurar variables
echo 'DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"' > .env
echo 'API_KEY="happyrobot-api-key"' >> .env

# 3. Instalar y configurar
npm install
npx prisma db push
npm run db:seed

# 4. Iniciar
npm run dev
```

## API Endpoints

Autenticacion: `Authorization: Bearer <API_KEY>`

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /api/verify-mc | Verifica numero MC con FMCSA |
| POST | /api/loads/search | Busca cargas por criterios |
| GET | /api/loads/list | Lista todas las cargas |
| POST | /api/pricing/evaluate | Evalua contraoferta de precio |
| POST | /api/calls/ingest | Registra resultado de llamada |
| GET | /api/calls/list | Lista llamadas con filtros |
| GET | /api/calls/[id] | Detalle de una llamada |

## Decisiones de Diseno

### Base de datos

- **PostgreSQL sobre SQLite**: Aunque SQLite es mas simple, PostgreSQL es la opcion profesional para produccion. Railway lo ofrece integrado sin costo adicional significativo.

### Prisma db push vs migrations

- **db push**: Para este proyecto de challenge, `db push` es suficiente y mas simple. En produccion real se usarian migraciones para control de versiones del schema.

### Railway sobre Fly.io

- **Fly.io**: Requiere CLI, scripts de setup, y el PostgreSQL gratuito se suspende por inactividad.
- **Railway**: Todo desde el dashboard, PostgreSQL siempre activo, CI/CD integrado sin configuracion adicional.

### Estructura de carpetas

- **features/**: Logica de negocio organizada por dominio (loads, calls, pricing, verify-mc)
- **components/**: UI components reutilizables
- **lib/**: Utilidades compartidas (auth, errors, constants)

## Testing

```bash
npm test
```

Tests unitarios para endpoints de API usando Vitest.
