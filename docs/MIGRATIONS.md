# Migraciones de Base de Datos

## ¿Cómo funciona?

Prisma usa un sistema de migraciones versionadas: cada cambio al schema genera un archivo SQL en `prisma/migrations/` que se aplica en orden.

**En desarrollo**: Creas y aplicas migraciones localmente  
**En producción**: Las migraciones se aplican automáticamente en cada deploy

## Setup inicial (primera vez)

**IMPORTANTE**: Debes crear la primera migración antes del primer deploy:

```bash
# 1. Levantar PostgreSQL local
docker-compose up -d

# 2. Configurar DATABASE_URL (ya debería estar en .env)
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/happyrobot"

# 3. Crear la migración inicial desde tu schema actual
npm run db:migrate -- --name init
```

Esto creará `prisma/migrations/YYYYMMDDHHMMSS_init/migration.sql` con todo tu schema actual.

**Commit y push** estos archivos antes del primer deploy a Render.

## Flujo de trabajo normal

### Desarrollo Local

Cuando modificas `prisma/schema.prisma`:

```bash
# Crea la migración y la aplica automáticamente a tu BD local
npm run db:migrate
```

Esto:
1. Crea un archivo SQL en `prisma/migrations/`
2. Aplica la migración a tu BD local
3. Regenera el cliente de Prisma

### Producción (Render.com)

**Las migraciones se aplican automáticamente** cuando Render despliega:

1. Render construye el Docker
2. En el `CMD` del Dockerfile se ejecuta: `prisma migrate deploy`
3. Esto aplica todas las migraciones pendientes (solo las nuevas)
4. Luego inicia el servidor

**No necesitas hacer nada manualmente** - cada deploy aplica las migraciones automáticamente.

## Cambiar el Schema (flujo completo)

1. **Modifica** `prisma/schema.prisma`
2. **Ejecuta** `npm run db:migrate` (en local) - Prisma te pedirá un nombre descriptivo
3. **Verifica** que la migración funciona localmente
4. **Commit** los cambios (incluyendo `prisma/migrations/`)
5. **Push** a GitHub
6. **Render despliega automáticamente** y aplica la migración

**Ejemplo práctico:**

```bash
# Cambias schema.prisma para añadir un campo nuevo
# Luego:
npm run db:migrate
# Prisma pregunta: "Enter a name for the new migration:"
# Respondes: "add_user_email_field"
# Prisma crea: prisma/migrations/20240101120000_add_user_email_field/migration.sql

git add prisma/
git commit -m "Add user email field"
git push
# Render despliega y aplica la migración automáticamente
```

## Ver Estado de Migraciones

```bash
# Ver qué migraciones están aplicadas
npx prisma migrate status
```

## Rollback (si es necesario)

Prisma no tiene rollback automático. Si necesitas revertir:

1. Modifica el schema para volver al estado anterior
2. Crea una nueva migración: `npm run db:migrate`
3. O restaura desde backup de la BD

## Seed de Datos

Para poblar datos iniciales en producción:

```bash
# Obtener DATABASE_URL del dashboard de Render
export DATABASE_URL="postgresql://..."

# Ejecutar seed
npm run db:seed
```

## Resumen

- **Desarrollo**: `npm run db:migrate` (crea y aplica)
- **Producción**: Automático en cada deploy (`prisma migrate deploy`)
- **Schema changes**: Modificar `schema.prisma` → migrar → commit → push → deploy automático

