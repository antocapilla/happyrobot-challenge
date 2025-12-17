# Docker Compose - Desarrollo Local

Levanta todo igual que en producción:

```bash
# Construir y levantar todo (BD + App)
docker-compose up --build

# En modo detached (background)
docker-compose up -d --build

# Ver logs
docker-compose logs -f app

# Detener
docker-compose down

# Resetear BD (borra datos)
docker-compose down -v
```

**App disponible en:** http://localhost:3000

**Nota:** Si solo quieres la BD y desarrollar con hot-reload:
```bash
docker-compose up -d db
bun run dev
```
