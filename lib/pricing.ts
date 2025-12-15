import { PricingEvaluationParams, PricingEvaluationResult } from "./types";

const MAX_ROUNDS = 3;

export function evaluateCounterOffer(params: PricingEvaluationParams): PricingEvaluationResult {
  const { listed_rate, counter_rate, round } = params;
  
  // Calculate max acceptable rate: listed_rate + buffer
  // buffer = min(250, 0.12 * listed_rate)
  const buffer = Math.min(250, 0.12 * listed_rate);
  const max_acceptable_rate = listed_rate + buffer;

  if (round > MAX_ROUNDS) {
    return {
      decision: "reject",
      approved_rate: null,
      counter_rate: null,
      reason: "Maximum negotiation rounds exceeded",
      error: false,
      max_rounds: MAX_ROUNDS,
    };
  }

  if (counter_rate <= max_acceptable_rate) {
    return {
      decision: "accept",
      approved_rate: counter_rate,
      counter_rate: null,
      reason: "Counter offer is within acceptable range",
      error: false,
      max_rounds: MAX_ROUNDS,
    };
  }

  // Counter with max acceptable rate
  if (round < MAX_ROUNDS) {
    return {
      decision: "counter",
      approved_rate: null,
      counter_rate: max_acceptable_rate,
      reason: `Counter offer exceeds maximum acceptable rate. Offering ${max_acceptable_rate}`,
      error: false,
      max_rounds: MAX_ROUNDS,
    };
  }

  // Final round: one last counter
  return {
    decision: "counter",
    approved_rate: null,
    counter_rate: max_acceptable_rate,
    reason: "Final counter offer",
    error: false,
    max_rounds: MAX_ROUNDS,
  };
}

