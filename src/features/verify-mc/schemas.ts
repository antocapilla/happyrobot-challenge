import { z } from "zod";

export const mcVerificationSchema = z.object({
  mc_number: z.string().min(1, "MC number is required").regex(/^\d+$/, "MC number must contain only digits"),
});


