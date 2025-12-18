import { z } from "zod";

export const callOutcomeSchema = z.enum([
  "booked_transfer",
  "not_verified",
  "no_load_found",
  "negotiation_failed",
  "not_interested",
  "call_dropped",
]);

export const callSentimentSchema = z.enum(["positive", "neutral", "negative"]);

export const createCallSchema = z.object({
  call_id: z.string().optional(),
  started_at: z.string().datetime().transform((str) => new Date(str)),
  transcript: z.string().optional().nullable().transform((val) => val ?? undefined),
  outcome: callOutcomeSchema,
  sentiment: callSentimentSchema,
  mc_number: z.string().optional().nullable().transform((val) => val ?? null),
  selected_load_id: z.string().optional().nullable().transform((val) => val ?? null),
  initial_rate: z.number().optional().nullable().transform((val) => val ?? null),
  final_rate: z.number().optional().nullable().transform((val) => val ?? null),
  negotiation_rounds: z.number().int().optional().nullable().transform((val) => val ?? null),
});

export type CreateCallInput = z.infer<typeof createCallSchema>;

/**
 * Schema para queries de listado de calls
 */
export const listCallsQuerySchema = z.object({
  outcome: callOutcomeSchema.optional(),
  sentiment: callSentimentSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

