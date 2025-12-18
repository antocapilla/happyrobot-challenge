import { z } from "zod";

const equipmentTypeEnum = z.enum([
  "dry_van",
  "reefer",
  "flatbed",
  "step_deck",
  "double_drop",
  "lowboy",
  "other",
]);

export const loadSearchSchema = z.object({
  equipment_type: equipmentTypeEnum.optional(),
  origin: z
    .string()
    .nullish()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
  destination: z
    .string()
    .nullish()
    .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined)),
});


