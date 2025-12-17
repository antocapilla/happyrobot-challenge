#!/bin/bash
set -e

echo "==> Inicializando base de datos..."

# 1. Verificar que PostgreSQL esté corriendo
echo "[1/3] Verificando PostgreSQL..."
if ! docker-compose ps db | grep -q "Up"; then
    echo "Levantando PostgreSQL..."
    docker-compose up -d db
    echo "Esperando a que PostgreSQL esté listo..."
    sleep 5
fi

# 2. Verificar si ya existen migraciones
if [ -d "prisma/migrations" ] && [ "$(ls -A prisma/migrations)" ]; then
    echo "[2/3] Migraciones ya existen, aplicándolas..."
    bun run db:migrate:deploy
else
    echo "[2/3] Creando migración inicial..."
    bun run db:migrate -- --name init
fi

# 3. Generar cliente de Prisma
echo "[3/3] Generando cliente de Prisma..."
bun run db:generate

echo ""
echo "✅ Base de datos inicializada correctamente!"
echo ""
echo "Para poblar datos de prueba: bun run db:seed"

