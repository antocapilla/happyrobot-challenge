# Deployment - Render.com

## Setup inicial (una vez)

### 1. Subir cambios a GitHub

```bash
git add render.yaml docs/DEPLOY.md README.md
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

**Las migraciones se aplican automáticamente** en cada deploy. El Dockerfile ejecuta `prisma migrate deploy` antes de iniciar el servidor.

**Para crear la primera migración (antes del primer deploy):**

```bash
docker-compose up -d db
bun run db:migrate -- --name init
git add prisma/migrations/
git commit -m "Add initial migration"
git push
```

**Para cambiar el schema:**

1. Modificar `prisma/schema.prisma`
2. Ejecutar `bun run db:migrate` (en local)
3. Commit cambios (incluyendo `prisma/migrations/`)
4. Push → Render despliega automáticamente

## Seed de datos (opcional)

Si necesitas datos de prueba:

```bash
# Obtener DATABASE_URL del dashboard de Render (en la sección de la base de datos)
export DATABASE_URL="postgresql://..." # Copiar desde Render
bun run db:seed
```

## URLs

- **App**: Se genera automáticamente (ej: `https://happyrobot-app.onrender.com`)
- **API Key**: La que configures en variables de entorno

## Deploy automático

Render despliega automáticamente en cada push a `main` (o la rama que configures).

