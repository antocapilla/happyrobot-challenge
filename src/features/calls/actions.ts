"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/server/db";
import type { CreateCallInput } from "./schemas";
import { ApiError } from "@/lib/errors";
import { Prisma } from "@/generated/prisma/client";
import { randomUUID } from "crypto";

export async function createCall(input: CreateCallInput): Promise<{ call_id: string }> {
  try {
    const call_id = input.call_id || `call_${randomUUID()}`;
    
    const data = {
      started_at: input.started_at,
      transcript: input.transcript,
      outcome: input.outcome,
      sentiment: input.sentiment,
      mc_number: input.mc_number,
      selected_load_id: input.selected_load_id,
      initial_rate: input.initial_rate,
      final_rate: input.final_rate,
      negotiation_rounds: input.negotiation_rounds,
    };

    await db.call.upsert({
      where: { call_id },
      create: {
        call_id,
        ...data,
      },
      update: data,
    });

    revalidatePath("/calls");
    revalidatePath("/api/calls");

    return { call_id };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      throw new ApiError(500, `Database error: ${error.message}`);
    }
    throw new ApiError(500, "Failed to create call");
  }
}
