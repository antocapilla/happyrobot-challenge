import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { Load as PrismaLoad } from "@/generated/prisma/client";
import { loadSearchSchema } from "./schemas";

// ============================================================================
// Zod-inferred types (for validation)
// ============================================================================

export type LoadSearchParams = z.infer<typeof loadSearchSchema>;

// ============================================================================
// Prisma types (for database operations)
// ============================================================================

/** Full Load entity from database */
export type Load = PrismaLoad;

/** Type for creating a new Load */
export type LoadCreateInput = Prisma.LoadCreateInput;

/** Type for updating an existing Load */
export type LoadUpdateInput = Prisma.LoadUpdateInput;

/** Type for filtering Loads in queries */
export type LoadWhereInput = Prisma.LoadWhereInput;

/** Type for ordering Loads */
export type LoadOrderByInput = Prisma.LoadOrderByWithRelationInput;
