"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import { CallInput } from "./types";
import { ApiError } from "@/lib/errors";
import { Prisma } from "@prisma/client";

/**
 * Save or update a call using Prisma types for type safety.
 */
export async function saveCall(call: CallInput): Promise<void> {
  try {
    // Common data for both create and update
    const commonData = {
      started_at: new Date(call.started_at),
      transcript: call.transcript,
      outcome: call.outcome,
      sentiment: call.sentiment,
      mc_number: call.extracted.mc_number ?? null,
      load_id: call.extracted.load_id ?? null,
      initial_rate: call.extracted.initial_rate ?? null,
      agreed_rate: call.extracted.agreed_rate ?? null,
      negotiation_rounds: call.extracted.negotiation_rounds ?? null,
    };

    await db.call.upsert({
      where: { call_id: call.call_id },
      update: commonData satisfies Prisma.CallUpdateInput,
      create: {
        call_id: call.call_id,
        ...commonData,
      } satisfies Prisma.CallCreateInput,
    });

    revalidatePath("/api/calls");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to save call data");
  }
}
