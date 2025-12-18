# Architecture

This document explains how the application is structured and how different parts work together.

## Overview

This is a Next.js application that handles inbound carrier sales calls. It provides APIs for carrier verification, load search, pricing evaluation, and call tracking.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Runtime**: Bun
- **Deployment**: Docker + Render.com

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API route handlers
│   │   ├── calls/          # Call endpoints
│   │   ├── loads/          # Load endpoints
│   │   ├── pricing/        # Pricing endpoints
│   │   └── verify-mc/       # MC verification endpoint
│   └── api-docs/           # Swagger UI documentation
│
├── features/               # Feature-based organization
│   ├── calls/
│   │   ├── actions.ts      # Server actions (mutations)
│   │   ├── queries.ts      # Server queries (reads)
│   │   ├── schemas.ts      # Zod validation schemas
│   │   ├── types.ts        # TypeScript types
│   │   └── components/     # React components
│   ├── loads/
│   ├── pricing/
│   └── verify-mc/
│
├── server/                 # Server-only utilities
│   ├── db.ts              # Prisma client singleton
│   └── env.ts             # Environment validation
│
└── lib/                    # Shared utilities
    ├── errors.ts          # Error handling
    ├── middleware.ts      # API middleware
    └── openapi.ts         # OpenAPI spec
```

## Key Design Decisions

### Feature-First Organization

Code is organized by feature rather than by technical layer. Each feature folder contains everything related to that feature:
- Server actions for mutations
- Server queries for reads
- Validation schemas
- Type definitions
- UI components

This makes it easy to find everything related to a feature in one place.

### Server/Client Separation

We clearly separate server and client code:

- **Server Actions** (`actions.ts`) - Marked with `"use server"`, handle mutations
- **Server Queries** (`queries.ts`) - Marked with `"server-only"`, handle reads
- **Route Handlers** (`app/api/`) - HTTP endpoints for external integrations

This separation ensures sensitive operations never run on the client.

### Prisma Client Singleton

The Prisma client is initialized once using a singleton pattern:

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient();
```

This prevents:
- Multiple instances in development (with hot module reload)
- Connection leaks in production/serverless environments

### Input Validation

All inputs are validated with Zod schemas at API boundaries:
- Route handlers validate request bodies
- Server actions validate parameters
- Invalid inputs return clear error messages

### Cache Management

After mutations, we use Next.js cache revalidation to keep the UI updated:
- `revalidatePath()` - Revalidate specific pages
- `revalidateTag()` - Revalidate tagged cache entries

## Data Flow

### Reading Data

```
Route Handler / Server Component
  → features/*/queries.ts
    → src/server/db.ts (Prisma)
      → PostgreSQL Database
```

### Writing Data

```
Route Handler / Client Component
  → features/*/actions.ts ("use server")
    → src/server/db.ts (Prisma)
      → PostgreSQL Database
      → revalidatePath() / revalidateTag()
```

## Database Schema

Two main models:

**Load** - Represents a shipping job
- Unique `load_id`
- Origin, destination, pickup/delivery times
- Equipment type, rate, weight, dimensions
- Can have multiple associated calls

**Call** - Represents a sales call
- Unique `call_id`
- Outcome, sentiment, transcript
- Optional reference to a Load
- Negotiation details (rates, rounds)

See `prisma/schema.prisma` for the complete schema.

## Environment Variables

Environment variables are validated at startup using Zod (`src/server/env.ts`):
- Application fails fast if required variables are missing
- Type-safe access to environment variables
- Clear documentation of what's needed

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `API_KEY` - API key for authentication

## API Design

### Authentication

Most endpoints require an API key in the `X-API-Key` header. The middleware (`src/lib/middleware.ts`) handles this automatically.

### Error Handling

All errors are handled consistently:
- Validation errors return `400` with clear messages
- Authentication errors return `401`
- Server errors return `500` with generic messages (details in logs)

### Documentation

Interactive API documentation is available at `/api-docs` using Swagger UI. The OpenAPI spec is auto-generated from code in `src/lib/openapi.ts`.

## Development Workflow

1. **Database changes**: Modify `prisma/schema.prisma`, run `bun run db:migrate`
2. **API changes**: Update route handlers in `app/api/`, update OpenAPI spec
3. **Feature changes**: Update feature folder (actions, queries, schemas, components)

## Deployment

The application runs in Docker containers:
- Database: PostgreSQL 16
- Application: Next.js production build

Migrations run automatically on deploy using `prisma migrate deploy`.

See [deployment guide](./deploy.md) for details.

