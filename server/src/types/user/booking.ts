import { z } from "zod";

export const createBookingSchema = z.object({
  venueId: z.string().min(1),
  slotId: z.string().min(1),
  participants: z.number().int().positive().optional(),
});
