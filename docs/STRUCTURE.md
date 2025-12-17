# Project Structure

## Organization

```
happyrobot-challenge/
├── docs/                    # Documentation
│   ├── ARCHITECTURE.md     # Project architecture
│   ├── DEPLOY.md           # Deployment guide
│   ├── DOCKER.md           # Docker usage
│   ├── MIGRATIONS.md       # Migrations guide
│   └── ...
├── scripts/                # Utility scripts
│   └── init-db.sh         # Database initialization
├── src/                    # Source code
├── prisma/                 # Schema and migrations
├── public/                 # Static files
├── tests/                  # Tests
├── postman/                # Postman collections
├── docker-compose.yml      # Local Docker configuration
├── Dockerfile              # Production Docker image
├── render.yaml             # Render.com configuration
└── README.md               # Main documentation
```

## Configuration Files

- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `next.config.ts` - Next.js configuration
- `eslint.config.mjs` - ESLint configuration
- `vitest.config.ts` - Test configuration
- `components.json` - shadcn/ui configuration

## Deployment Files

- `Dockerfile` - Docker image for production
- `docker-compose.yml` - Local orchestration
- `render.yaml` - Render.com configuration
