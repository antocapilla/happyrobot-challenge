import { z } from "zod";
import { pricingEvaluationSchema } from "./schemas";

export type PricingEvaluationParams = z.infer<typeof pricingEvaluationSchema>;

export interface PricingEvaluationResult {
  decision: "accept" | "counter" | "reject";
  approved_rate: number | null;
  counter_rate: number | null;
  reason: string;
  error: boolean;
  max_rounds: number;
}
