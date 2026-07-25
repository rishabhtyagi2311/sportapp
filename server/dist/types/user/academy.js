"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReviewSchema = exports.createDemoBookingSchema = exports.enrollChildSchema = exports.updateChildProfileSchema = exports.createChildProfileSchema = exports.publicAcademyFiltersSchema = void 0;
const zod_1 = require("zod");
exports.publicAcademyFiltersSchema = zod_1.z.object({
    city: zod_1.z.string().optional(),
    sportType: zod_1.z.string().optional(),
});
exports.createChildProfileSchema = zod_1.z.object({
    childName: zod_1.z.string().min(1),
    childAge: zod_1.z.number().int().positive(),
    motherName: zod_1.z.string().optional(),
    fatherName: zod_1.z.string().min(1),
    fatherContact: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
});
exports.updateChildProfileSchema = exports.createChildProfileSchema.partial();
exports.enrollChildSchema = zod_1.z.object({
    childProfileId: zod_1.z.string().min(1),
    academyId: zod_1.z.string().min(1),
});
exports.createDemoBookingSchema = zod_1.z.object({
    childProfileId: zod_1.z.string().min(1),
    academyId: zod_1.z.string().min(1),
    bookingDate: zod_1.z.string().min(1),
});
exports.createReviewSchema = zod_1.z.object({
    academyId: zod_1.z.string().min(1),
    childProfileId: zod_1.z.string().min(1),
    rating: zod_1.z.number().int().min(1).max(5),
    title: zod_1.z.string().optional(),
    comment: zod_1.z.string().min(1),
});
//# sourceMappingURL=academy.js.map