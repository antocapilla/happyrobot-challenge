# Technical Justifications

## 1. Challenge Context

Automation system for inbound carrier sales. Features:
- MC verification (FMCSA)
- Available loads search
- Price/counteroffer evaluation
- Call registration and query
- Dashboard with metrics

---

## 2. Technology Stack

| Component | Choice | Reason |
|------------|----------|-------|
| Framework | Next.js 16 | App Router, integrated API Routes, RSC, simple deployment |
| Language | TypeScript | Type safety end-to-end |
| ORM | Prisma 6 | Type-safe, automatic migrations, good DX |
| Database | PostgreSQL | Robust, scalable, native on Fly.io |
| Validation | Zod 4 | Runtime validation + type inference |
| UI | shadcn/ui | Accessible components, no lock-in, customizable |
| Charts | Recharts | Declarative, composable, good React integration |
| Data fetching | TanStack Query | Cache, automatic refetch, optimistic updates |
| Testing | Vitest | Fast, native TS/JSX compatible |
| Deploy | Fly.io | Edge network, integrated Postgres, reasonable pricing |

---

## 3. Architecture

### Feature-First

```
src/features/
  calls/
    actions.ts     # Server Actions (mutations)
    queries.ts     # Server-only (reads)
    schemas.ts     # Zod validation
    types.ts       # TS types
    use-queries.ts # React Query hooks
    components/    # Feature UI
  loads/
  pricing/
  verify-mc/
```

**Advantages:**
- Colocation: everything related together
- Scalability: independent features
- Safe refactoring: isolated changes

### Server/Client Separation

| File | Context | Purpose |
|---------|----------|-----------|
| `queries.ts` | Server-only | Direct DB access |
| `actions.ts` | Server Actions | Mutations from client |
| `use-queries.ts` | Client | React Query hooks |
| `api/*/route.ts` | Route Handlers | External HTTP endpoints |

### Prisma Singleton

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
export const db = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
```

Prevents multiple connections in development (HMR).

---

## 4. Data Model

```sql
Load (loads)
  - load_id, origin, destination
  - pickup_datetime, delivery_datetime
  - equipment_type, loadboard_rate
  - weight, miles, commodity_type

Call (calls)
  - call_id, started_at, transcript
  - outcome, sentiment
  - mc_number, load_id
  - initial_rate, agreed_rate
  - negotiation_rounds
```

**Indexes:** `outcome`, `sentiment`, `started_at` (frequent filters)

---

## 5. API

### Authentication
Header `x-api-key: <API_KEY>` on all endpoints (except GET `/api/calls` and GET `/api/calls/[id]`).

### Endpoints

| Method | Route | Description |
|--------|------|-------------|
| POST | /api/verify-mc | Verify MC number |
| GET | /api/loads/search | Search loads by criteria |
| GET | /api/loads/list | List all loads |
| POST | /api/pricing/evaluate | Evaluate counteroffer |
| POST | /api/calls | Create call |
| GET | /api/calls | List calls (filters, pagination) |
| GET | /api/calls/[id] | Get call details |

### Standard response

```json
{
  "error": false,
  "data": { ... },
  "pagination": { "page": 1, "limit": 10, "total": 100, "hasMore": true }
}
```

---

## 6. Frontend

### Dashboard
- Real-time KPIs: calls, acceptance rate, revenue, average negotiation
- Charts: temporal trends, outcome distribution, sentiment
- Filters: 7d, 30d, 90d, custom range
- Recent calls table

### State Management
- **TanStack Query**: server state (automatic cache, refetch)
- **useState**: local UI state (filters, modals)
- No Redux: no complex global state that justifies it

---

## 7. Testing

```bash
npm test        # run tests
npm test:watch  # watch mode
```

API unit tests:
- Pagination works correctly
- Filters return expected data
- Limit validation (max 100)
- Correct response structure

---

## 8. Infrastructure

### Docker

Minimalist multi-stage build:
1. **builder**: npm ci, prisma generate, next build
2. **runner**: production artifacts only

Non-root user (`nextjs:nodejs`).

### Fly.io

```bash
./scripts/setup.sh  # creates app + postgres + deploy
```

The script automates:
- Create app on Fly.io
- Create Postgres (shared-cpu-1x, 1GB)
- Attach database
- Set secrets (API_KEY)
- Deploy + migrations

### CI/CD

GitHub Actions on push to `main`:
1. `fly deploy`
2. `prisma migrate deploy`

---

## 9. Key Decisions

| Decision | Discarded alternative | Reason |
|----------|------------------------|-------|
| PostgreSQL | SQLite | Real production, Fly includes it |
| Fly.io | Vercel/Railway | Integrated Postgres, good price |
| React Query | SWR / manual fetch | Robust cache, devtools, refetch |
| shadcn/ui | MUI / Chakra | No runtime, code in repo |
| Recharts | Chart.js | More React-friendly |
| Vitest | Jest | Faster, better DX with Vite |

---

## 10. Out of Scope

- Rate limiting
- Structured logging (Sentry)
- E2E tests (Playwright)
- Auth with sessions/JWT
- WebSockets for real-time
