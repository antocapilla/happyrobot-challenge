import "server-only";

import { db } from "@/server/db";
import { Call, CallFilters, CallWhereInput, PaginationMeta } from "./types";
import { ApiError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";

const DEFAULT_PAGE_SIZE = 10;

interface GetCallsResult {
  calls: Call[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Build where clause from filters using Prisma types.
 */
function buildWhereClause(filters?: CallFilters): CallWhereInput {
  const where: CallWhereInput = {};

  if (filters?.outcome) {
    where.outcome = filters.outcome;
  }

  if (filters?.sentiment) {
    where.sentiment = filters.sentiment;
  }

  if (filters?.dateFrom || filters?.dateTo) {
    where.started_at = {};
    if (filters.dateFrom) {
      where.started_at.gte = filters.dateFrom;
    }
    if (filters.dateTo) {
      where.started_at.lte = filters.dateTo;
    }
  }

  if (filters?.search) {
    const searchTerm = filters.search.trim();
    if (searchTerm.length > 0) {
      // Use contains for flexible search, but this can be slow on large datasets
      // Consider adding full-text search indexes if this becomes a bottleneck
      where.OR = [
        { call_id: { contains: searchTerm, mode: "insensitive" } },
        { mc_number: { contains: searchTerm, mode: "insensitive" } },
        { selected_load_id: { contains: searchTerm, mode: "insensitive" } },
      ];
    }
  }

  return where;
}

/**
 * Get calls with optional filters and pagination.
 */
export async function getCalls(filters?: CallFilters): Promise<GetCallsResult> {
  try {
    const where = buildWhereClause(filters);
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? DEFAULT_PAGE_SIZE;
    const skip = (page - 1) * limit;

    const [calls, total] = await Promise.all([
      db.call.findMany({
        where,
        orderBy: { started_at: "desc" } satisfies Prisma.CallOrderByWithRelationInput,
        skip,
        take: limit,
      }),
      db.call.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      calls,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Check for timeout errors specifically
      if (error.message.includes("timeout") || error.message.includes("timed out")) {
        throw new ApiError(504, "Database query timeout");
      }
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    
    // Check for generic timeout errors
    if (error instanceof Error && (error.message.includes("timeout") || error.message.includes("timed out"))) {
      throw new ApiError(504, "Operation timeout");
    }
    
    throw new ApiError(500, "Failed to read calls data");
  }
}

/**
 * Get a call by its ID.
 */
export async function getCallById(callId: string): Promise<Call | null> {
  try {
    return await db.call.findUnique({
      where: { call_id: callId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to read call data");
  }
}
