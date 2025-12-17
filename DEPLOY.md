# Deployment - Render.com

## Setup inicial (una vez)

### 1. Subir cambios a GitHub

```bash
git add render.yaml DEPLOY.md README.md
git commit -m "Add Render.com deployment config"
git push
```

### 2. Crear cuenta y conectar repo

1. Ir a [Render.com](https://render.com) y crear cuenta
2. Conectar tu cuenta de GitHub (si no está conectada)
3. En el dashboard, clic en **"New +"** → **"Blueprint"**
4. Seleccionar tu repositorio `happyrobot-challenge`
5. Render detectará `render.yaml` automáticamente
6. Clic en **"Apply"**

### 3. Configurar API_KEY

1. En el dashboard, abrir el servicio **"happyrobot-app"**
2. Ir a **"Environment"**
3. Añadir variable:
   - **Key**: `API_KEY`
   - **Value**: `happyrobot-api-key` (o la que uses)
4. Guardar

### 4. Esperar deploy

- Render construirá la imagen Docker y desplegará
- El primer deploy puede tardar 5-10 minutos
- Verás los logs en tiempo real

### 5. Verificar

- Al terminar, verás la URL (ej: `https://happyrobot-app.onrender.com`)
- Probar la URL en el navegador

## Migraciones de Base de Datos

### ¿Cuándo se crea el schema?

El schema se crea automáticamente en el primer deploy mediante migraciones de Prisma.

### Crear la primera migración (antes del primer deploy)

**IMPORTANTE**: Debes crear la primera migración desde tu BD local antes de hacer el primer deploy:

```bash
# 1. Asegúrate de tener PostgreSQL corriendo localmente
docker-compose up -d

# 2. Configurar DATABASE_URL local
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"

# 3. Crear la migración inicial desde tu schema actual
npm run db:migrate -- --name init
```

Esto creará `prisma/migrations/` con el SQL necesario. **Commit y push** estos archivos antes del deploy.

### ¿Cómo funcionan las migraciones?

**En desarrollo (local):**
- Modificas `prisma/schema.prisma`
- Ejecutas `npm run db:migrate` (crea y aplica la migración)
- Commit los cambios incluyendo `prisma/migrations/`

**En producción (Render.com):**
- Las migraciones se aplican **automáticamente** en cada deploy
- El Dockerfile ejecuta `prisma migrate deploy` antes de iniciar el servidor
- Solo aplica migraciones pendientes (no afecta las ya aplicadas)

### Flujo completo de cambios al schema

1. Modificar `prisma/schema.prisma`
2. Ejecutar `npm run db:migrate` (en local)
3. Commit cambios (incluyendo `prisma/migrations/`)
4. Push a GitHub
5. Render despliega automáticamente y aplica la migración

Ver [docs/MIGRATIONS.md](./docs/MIGRATIONS.md) para más detalles.

## Seed de datos (opcional)

Si necesitas datos de prueba:

```bash
# Obtener DATABASE_URL del dashboard de Render (en la sección de la base de datos)
export DATABASE_URL="postgresql://..." # Copiar desde Render
npm run db:seed
```

## URLs

- **App**: Se genera automáticamente (ej: `https://happyrobot-app.onrender.com`)
- **API Key**: La que configures en variables de entorno

## Deploy automático

Render despliega automáticamente en cada push a `main` (o la rama que configures).

## Ventajas vs Fly.io

- Setup más simple (solo conectar repo)
- Dashboard más intuitivo
- PostgreSQL managed incluido
- Auto-deploy desde Git
- Plan gratuito generoso
