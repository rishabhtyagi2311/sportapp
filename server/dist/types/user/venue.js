"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicVenueFiltersSchema = void 0;
const zod_1 = require("zod");
exports.publicVenueFiltersSchema = zod_1.z.object({
    city: zod_1.z.string().optional(),
});
//# sourceMappingURL=venue.js.map