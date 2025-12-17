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

const inputJsonValueSchema: z.ZodType<any> = z.lazy(() =>
  z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.record(z.string(), z.lazy(() => z.union([inputJsonValueSchema, z.literal(null)]))),
    z.array(z.lazy(() => z.union([inputJsonValueSchema, z.literal(null)]))),
  ])
);

export const callIngestSchema = z.object({
  call_id: z.string(),
  started_at: z.string().datetime().transform((str) => new Date(str)),
  transcript: z.string().optional().nullable().transform((val) => val ?? undefined),
  outcome: callOutcomeSchema,
  sentiment: callSentimentSchema,
  mc_number: z.string().optional().nullable().transform((val) => val ?? null),
  selected_load_id: z.string().optional().nullable().transform((val) => val ?? null),
  initial_rate: z.number().optional().nullable().transform((val) => val ?? null),
  final_rate: z.number().optional().nullable().transform((val) => val ?? null),
  negotiation_rounds: z.number().int().optional().nullable().transform((val) => val ?? null),
  raw_extracted: z.union([z.enum(["DbNull", "JsonNull"]), inputJsonValueSchema]).optional().transform((val) => {
    if (val === "DbNull" || val === "JsonNull") return null;
    return val;
  }),
});

export type CallIngested = z.infer<typeof callIngestSchema>;

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

