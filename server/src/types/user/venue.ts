import { z } from "zod";

export const publicVenueFiltersSchema = z.object({
  city: z.string().optional(),
});
