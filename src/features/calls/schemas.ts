import { z } from "zod";
import { CALL_OUTCOMES, CALL_SENTIMENTS } from "@/lib/constants";

export const callOutcomeSchema = z.enum(CALL_OUTCOMES);

export const callSentimentSchema = z.enum(CALL_SENTIMENTS);

export const callExtractedSchema = z.object({
  mc_number: z.string().optional(),
  load_id: z.string().optional(),
  initial_rate: z.number().positive().optional().nullable(),
  agreed_rate: z.number().positive().optional().nullable(),
  negotiation_rounds: z.number().int().min(0).max(3).optional(),
});

export const callSchema = z.object({
  call_id: z.string().min(1, "Call ID is required"),
  started_at: z.string().datetime("Invalid datetime format"),
  transcript: z.string(),
  outcome: callOutcomeSchema,
  sentiment: callSentimentSchema,
  extracted: callExtractedSchema,
});

export const listCallsQuerySchema = z.object({
  outcome: callOutcomeSchema.optional(),
  sentiment: callSentimentSchema.optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

