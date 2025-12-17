import { callOutcomeSchema, callSentimentSchema } from "@/features/calls/schemas";

export const API_CONFIG = {
  TIMEOUT: 5000,
} as const;

export const PRICING_CONFIG = {
  MAX_NEGOTIATION_ROUNDS: 3,
  MAX_BUFFER_AMOUNT: 250,
  BUFFER_PERCENTAGE: 0.12,
} as const;

// Extract values from zod schemas to maintain single source of truth
export const CALL_OUTCOMES = callOutcomeSchema.options;
export const CALL_SENTIMENTS = callSentimentSchema.options;
