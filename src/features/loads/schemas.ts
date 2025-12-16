import { z } from "zod";

export const loadSearchSchema = z.object({
  equipment_type: z.string().optional(),
  origin: z.string().optional(),
  destination: z.string().optional(),
}).refine(
  (data) => data.equipment_type || data.origin || data.destination,
  { message: "At least one search parameter is required" }
);

