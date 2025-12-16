export const API_CONFIG = {
  TIMEOUT: 5000,
} as const;

export const PRICING_CONFIG = {
  MAX_NEGOTIATION_ROUNDS: 3,
  MAX_BUFFER_AMOUNT: 250,
  BUFFER_PERCENTAGE: 0.12,
} as const;

export const CALL_OUTCOMES = [
  "deal_accepted",
  "deal_rejected",
  "no_match",
  "carrier_ineligible",
  "transfer_to_rep",
  "abandoned",
] as const;

export const CALL_SENTIMENTS = ["positive", "neutral", "negative"] as const;
