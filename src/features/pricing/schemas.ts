import { z } from "zod";

export const pricingEvaluationSchema = z.object({
  mc_number: z.string().min(1, "MC number is required"),
  load_id: z.string().min(1, "Load ID is required"),
  listed_rate: z.number().positive("Listed rate must be positive"),
  counter_rate: z.number().positive("Counter rate must be positive"),
  round: z.number().int("Round must be an integer").min(1, "Round must be at least 1").max(3, "Round cannot exceed 3"),
});

