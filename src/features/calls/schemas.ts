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

/**
 * Flexible datetime schema that accepts:
 * - ISO 8601 strings (2025-12-17T10:05:00Z)
 * - Unix timestamps (seconds or milliseconds)
 * - Date-parseable strings
 */
const flexibleDatetimeSchema = z.union([
  z.string(),
  z.number(),
]).transform((val) => {
  if (typeof val === "number") {
    // Handle Unix timestamps (detect seconds vs milliseconds)
    const timestamp = val < 1e12 ? val * 1000 : val;
    return new Date(timestamp);
  }
  const parsed = new Date(val);
  if (isNaN(parsed.getTime())) {
    throw new Error(`Invalid date: ${val}`);
  }
  return parsed;
});

/**
 * Flexible transcript schema that accepts:
 * - String (direct transcript)
 * - Array of strings (joined with newlines)
 * - Array of objects with text/content property (common in transcription APIs)
 */
const flexibleTranscriptSchema = z.union([
  z.string(),
  z.array(z.string()),
  z.array(z.object({
    text: z.string().optional(),
    content: z.string().optional(),
    message: z.string().optional(),
  }).passthrough()),
]).optional().nullable().transform((val) => {
  if (val == null) return undefined;
  if (typeof val === "string") return val || undefined;
  if (Array.isArray(val)) {
    const texts = val.map((item) => {
      if (typeof item === "string") return item;
      return item.text || item.content || item.message || JSON.stringify(item);
    });
    return texts.join("\n") || undefined;
  }
  return undefined;
});

export const createCallSchema = z.object({
  call_id: z.string().optional(),
  started_at: flexibleDatetimeSchema,
  transcript: flexibleTranscriptSchema,
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

