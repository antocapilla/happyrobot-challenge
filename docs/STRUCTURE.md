# Estructura del Proyecto

## Organización

```
happyrobot-challenge/
├── docs/                    # Documentación
│   ├── ARCHITECTURE.md     # Arquitectura del proyecto
│   ├── DEPLOY.md           # Guía de deployment
│   ├── DOCKER.md           # Uso de Docker
│   ├── MIGRATIONS.md       # Guía de migraciones
│   └── ...
├── scripts/                # Scripts de utilidad
│   └── init-db.sh         # Inicialización de BD
├── src/                    # Código fuente
├── prisma/                 # Schema y migraciones
├── public/                 # Archivos estáticos
├── tests/                  # Tests
├── postman/                # Colecciones Postman
├── docker-compose.yml      # Configuración Docker local
├── Dockerfile              # Imagen Docker producción
├── render.yaml             # Configuración Render.com
└── README.md               # Documentación principal
```

## Archivos de Configuración

- `package.json` - Dependencias y scripts
- `tsconfig.json` - Configuración TypeScript
- `next.config.ts` - Configuración Next.js
- `eslint.config.mjs` - Configuración ESLint
- `vitest.config.ts` - Configuración tests
- `components.json` - Configuración shadcn/ui

## Archivos de Deployment

- `Dockerfile` - Imagen Docker para producción
- `docker-compose.yml` - Orquestación local
- `render.yaml` - Configuración Render.com

