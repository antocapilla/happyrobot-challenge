import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import type { Call as PrismaCall } from "@/generated/prisma/client";
import { callIngestSchema, callOutcomeSchema, callSentimentSchema } from "./schemas";

// ============================================================================
// Zod-inferred types (for validation)
// ============================================================================

export type CallOutcome = z.infer<typeof callOutcomeSchema>;
export type CallSentiment = z.infer<typeof callSentimentSchema>;
export type CallInput = z.infer<typeof callIngestSchema>;

// ============================================================================
// Prisma types (for database operations)
// ============================================================================

/** Full Call entity from database */
export type Call = PrismaCall;

/** Type for creating a new Call */
export type CallCreateInput = Prisma.CallCreateInput;

/** Type for updating an existing Call */
export type CallUpdateInput = Prisma.CallUpdateInput;

/** Type for filtering Calls in queries */
export type CallWhereInput = Prisma.CallWhereInput;

/** Type for ordering Calls */
export type CallOrderByInput = Prisma.CallOrderByWithRelationInput;

// ============================================================================
// API types
// ============================================================================

export interface CallFilters {
  outcome?: CallOutcome;
  sentiment?: CallSentiment;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface CallsListResponse {
  calls: Call[];
  count: number;
  pagination?: PaginationMeta;
}
