"use server";

import { PricingEvaluationParams, PricingEvaluationResult } from "./types";
import { PRICING_CONFIG } from "@/lib/constants";

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

function calculateMaxAcceptableRate(listedRate: number): number {
  const percentageBuffer = listedRate * PRICING_CONFIG.BUFFER_PERCENTAGE;
  const buffer = Math.min(PRICING_CONFIG.MAX_BUFFER_AMOUNT, percentageBuffer);
  return listedRate + buffer;
}

/**
 * Evaluate a counter offer and determine the response.
 */
export async function evaluateCounterOffer(
  params: PricingEvaluationParams
): Promise<PricingEvaluationResult> {
  const { listed_rate, counter_rate, round } = params;
  
  const maxAcceptableRate = calculateMaxAcceptableRate(listed_rate);

  if (counter_rate > maxAcceptableRate) {
    if (round >= PRICING_CONFIG.MAX_NEGOTIATION_ROUNDS) {
      return {
        decision: "reject",
        approved_rate: null,
        counter_rate: null,
        reason: "Maximum negotiation rounds exceeded. Counter offer exceeds acceptable range",
        error: false,
        max_rounds: PRICING_CONFIG.MAX_NEGOTIATION_ROUNDS,
      };
    }

    const roundedRate = roundToTwoDecimals(maxAcceptableRate);
    return {
      decision: "counter",
      approved_rate: null,
      counter_rate: roundedRate,
      reason: `Counter offer exceeds maximum acceptable rate. Offering $${roundedRate}`,
      error: false,
      max_rounds: PRICING_CONFIG.MAX_NEGOTIATION_ROUNDS,
    };
  }

  return {
    decision: "accept",
    approved_rate: roundToTwoDecimals(counter_rate),
    counter_rate: null,
    reason: "Counter offer is within acceptable range",
    error: false,
    max_rounds: PRICING_CONFIG.MAX_NEGOTIATION_ROUNDS,
  };
}
