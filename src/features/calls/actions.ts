"use server";

import { revalidateTag } from "next/cache";
import { db } from "@/server/db";
import type { CallIngested } from "./schemas";
import { ApiError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";

export async function saveCall(call: CallIngested): Promise<void> {
  try {
    const writableFields = {
      started_at: call.started_at,
      transcript: call.transcript,
      outcome: call.outcome,
      sentiment: call.sentiment,
      mc_number: call.mc_number,
      selected_load_id: call.selected_load_id,
      initial_rate: call.initial_rate,
      final_rate: call.final_rate,
      negotiation_rounds: call.negotiation_rounds,
      raw_extracted: call.raw_extracted,
    };

    await db.call.upsert({
      where: { call_id: call.call_id },
      create: {
        call_id: call.call_id,
        ...writableFields,
      },
      update: writableFields,
    });

    revalidateTag("calls", "default");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to save call data");
  }
}
