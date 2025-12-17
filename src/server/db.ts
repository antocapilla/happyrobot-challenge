import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
};

// Create a single connection pool for the adapter
const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString: process.env.DATABASE_URL!,
    max: 10, // Maximum number of clients in the pool
    idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
    connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection could not be established
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.pgPool = pgPool;
}

const adapter = new PrismaPg(pgPool);

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Disable Prisma's automatic logging to stdout
    // Errors are caught and handled by our error handlers (src/lib/errors.ts)
    // This prevents Turbopack stack traces from appearing in logs
    log: [],
    // Use minimal error format to reduce noise in error messages
    errorFormat: "minimal",
    transactionOptions: {
      maxWait: 10000, // Maximum time to wait for a transaction slot
      timeout: 30000, // Maximum time a transaction can run
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;
