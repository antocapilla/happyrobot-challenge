import "server-only";

import { db } from "@/server/db";
import { Load, LoadSearchParams, LoadWhereInput } from "./types";
import { ApiError } from "@/lib/errors";
import { Prisma, EquipmentType } from "@/generated/prisma/client";

/**
 * Get all loads with optional pagination.
 */
export async function getLoads(options?: { limit?: number; skip?: number }): Promise<Load[]> {
  try {
    return await db.load.findMany({
      orderBy: { createdAt: "desc" } satisfies Prisma.LoadOrderByWithRelationInput,
      take: options?.limit,
      skip: options?.skip,
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to read loads data");
  }
}

/**
 * Search loads by criteria.
 */
export async function searchLoads(params: LoadSearchParams): Promise<Load[]> {
  try {
    const where: LoadWhereInput = {};

    if (params.equipment_type) {
      where.equipment_type = params.equipment_type as EquipmentType;
    }

    if (params.origin) {
      where.origin = { contains: params.origin };
    }

    if (params.destination) {
      where.destination = { contains: params.destination };
    }

    const loads = await db.load.findMany({
      where,
      orderBy: { loadboard_rate: "desc" } satisfies Prisma.LoadOrderByWithRelationInput,
    });

    return loads.sort((a, b) => {
      const ratePerMileA = a.loadboard_rate / a.miles;
      const ratePerMileB = b.loadboard_rate / b.miles;
      return ratePerMileB - ratePerMileA;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to search loads");
  }
}

/**
 * Get a load by its load_id.
 */
export async function getLoadByLoadId(loadId: string): Promise<Load | null> {
  try {
    return await db.load.findUnique({
      where: { load_id: loadId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to read load data");
  }
}
