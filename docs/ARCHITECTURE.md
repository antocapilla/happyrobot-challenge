# Project Architecture

This document describes the architecture and structure of the project following best practices for Next.js App Router + Prisma.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # Route Handlers (public endpoints/webhooks)
│   │   ├── calls/
│   │   ├── loads/
│   │   ├── pricing/
│   │   └── verify-mc/
│   └── ...                 # Pages and layouts
│
├── features/               # Feature-first structure
│   ├── calls/
│   │   ├── actions.ts      # Server Actions (mutations)
│   │   ├── queries.ts      # Server-only queries (reads)
│   │   ├── schemas.ts      # Zod schemas for validation
│   │   ├── types.ts        # TypeScript types
│   │   └── components/     # Feature-specific components
│   ├── loads/
│   ├── pricing/
│   └── verify-mc/
│
├── server/                 # Server-only code
│   ├── db.ts              # Prisma Client singleton
│   └── env.ts             # Environment variables validation
│
└── lib/                    # Shared utilities
    ├── errors.ts          # Error handling
    └── ...
```

## Architecture Principles

### 1. Feature-First Organization

Each feature has its own folder with:
- **`actions.ts`**: Server Actions for mutations (marked with `"use server"`)
- **`queries.ts`**: Server-only read functions (marked with `"server-only"`)
- **`schemas.ts`**: Zod schemas for input validation
- **`types.ts`**: TypeScript types specific to the feature
- **`components/`**: React components specific to the feature

### 2. Server/Client Separation

- **Server-only**: Queries and business logic that should never run on the client
- **Server Actions**: Mutations that can be called from client components
- **Route Handlers**: HTTP endpoints for external integrations and webhooks

### 3. Prisma Client Singleton

The Prisma client is initialized once using the singleton pattern to avoid:
- Multiple instances in development with HMR
- Connection leaks in production/serverless

```typescript
// src/server/db.ts
export const db = globalForPrisma.prisma ?? new PrismaClient({...});
```

### 4. Validation with Zod

All inputs are validated with Zod at boundaries:
- Route Handlers: body/query params validation
- Server Actions: parameter validation

### 5. Cache Revalidation

After mutations (Server Actions), `revalidatePath` or `revalidateTag` is used to invalidate cache and keep the UI updated.

## Data Flow

### Reads (Queries)

```
Server Component / Route Handler
  → features/*/queries.ts
    → src/server/db.ts (Prisma)
      → Database
```

### Writes (Actions)

```
Client Component / Route Handler
  → features/*/actions.ts ("use server")
    → src/server/db.ts (Prisma)
      → Database
      → revalidatePath() / revalidateTag()
```

## Environment Variables

Environment variables are validated at startup using Zod (`src/server/env.ts`):
- Fails fast if critical variables are missing
- Safe typing of environment variables
- Clear documentation of required variables

## Database Migrations

- **Development**: `bun run db:migrate` (uses `prisma migrate dev`)
- **Production**: `prisma migrate deploy` (in CI/CD pipeline)
- **Seed**: `bun run db:seed` (optional in preview environments)

## Implemented Best Practices

✅ Prisma Client singleton to avoid connection leaks  
✅ Feature-first structure that scales well  
✅ Clear separation between queries (reads) and actions (writes)  
✅ Input validation with Zod at boundaries  
✅ Server-only code explicitly marked  
✅ Cache revalidation after mutations  
✅ Environment variables validated at startup  
✅ End-to-end typing with Prisma + Zod  
