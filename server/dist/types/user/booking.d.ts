import { z } from "zod";
export declare const createBookingSchema: z.ZodObject<{
    venueId: z.ZodString;
    slotId: z.ZodString;
    participants: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
//# sourceMappingURL=booking.d.ts.map