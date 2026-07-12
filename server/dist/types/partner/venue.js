"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVenueSchema = exports.createVenueSchema = void 0;
const zod_1 = require("zod");
const coordinatesSchema = zod_1.z.object({
    latitude: zod_1.z.number(),
    longitude: zod_1.z.number(),
});
const addressSchema = zod_1.z.object({
    street: zod_1.z.string(),
    city: zod_1.z.string(),
    state: zod_1.z.string(),
    pincode: zod_1.z.string(),
    coordinates: coordinatesSchema.optional(),
});
const contactInfoSchema = zod_1.z.object({
    phone: zod_1.z.string(),
    email: zod_1.z.string().optional(),
    whatsapp: zod_1.z.string().optional(),
});
const operatingDaySchema = zod_1.z.object({
    open: zod_1.z.string(),
    close: zod_1.z.string(),
    isOpen: zod_1.z.boolean(),
});
const operatingHoursSchema = zod_1.z.object({
    monday: operatingDaySchema,
    tuesday: operatingDaySchema,
    wednesday: operatingDaySchema,
    thursday: operatingDaySchema,
    friday: operatingDaySchema,
    saturday: operatingDaySchema,
    sunday: operatingDaySchema,
});
const peakPricingSchema = zod_1.z.object({
    enabled: zod_1.z.boolean(),
    startTime: zod_1.z.string(),
    endTime: zod_1.z.string(),
    price: zod_1.z.number().nonnegative(),
});
exports.createVenueSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    description: zod_1.z.string(),
    address: addressSchema,
    contactInfo: contactInfoSchema,
    operatingHours: operatingHoursSchema,
    peakPricing: peakPricingSchema.optional(),
    sports: zod_1.z.array(zod_1.z.any()),
    amenities: zod_1.z.array(zod_1.z.any()),
    images: zod_1.z.array(zod_1.z.string()),
    timeSlots: zod_1.z.array(zod_1.z.any()),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateVenueSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    isActive: zod_1.z.boolean().optional(),
    address: addressSchema.partial().optional(),
    contactInfo: contactInfoSchema.optional(),
    operatingHours: operatingHoursSchema.optional(),
    peakPricing: peakPricingSchema.optional(),
    sports: zod_1.z.array(zod_1.z.any()).optional(),
    amenities: zod_1.z.array(zod_1.z.any()).optional(),
});
//# sourceMappingURL=venue.js.map