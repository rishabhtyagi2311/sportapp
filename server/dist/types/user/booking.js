"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBookingSchema = void 0;
const zod_1 = require("zod");
exports.createBookingSchema = zod_1.z.object({
    venueId: zod_1.z.string().min(1),
    slotId: zod_1.z.string().min(1),
    participants: zod_1.z.number().int().positive().optional(),
});
//# sourceMappingURL=booking.js.map