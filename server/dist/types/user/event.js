"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRegistrationSchema = exports.createRegistrationSchema = exports.publicEventFiltersSchema = exports.updateEventSchema = exports.createEventSchema = void 0;
const zod_1 = require("zod");
const baseEventFields = {
    venueId: zod_1.z.string().optional(),
    locationName: zod_1.z.string().optional(),
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    sportName: zod_1.z.string().min(1),
    participationType: zod_1.z.enum(["individual", "team"]),
    teamSize: zod_1.z.number().int().positive().optional(),
    maxParticipants: zod_1.z.number().int().positive(),
    dateTime: zod_1.z.string().min(1),
    duration: zod_1.z.number().int().positive(),
    feeAmount: zod_1.z.number().nonnegative(),
    feeCurrency: zod_1.z.string().default("INR"),
    feeType: zod_1.z.enum(["per_person", "per_team", "total"]),
    isPublic: zod_1.z.boolean().default(true),
    registrationDeadline: zod_1.z.string().min(1),
};
exports.createEventSchema = zod_1.z
    .discriminatedUnion("eventType", [
    zod_1.z.object({ eventType: zod_1.z.literal("regular"), ...baseEventFields }),
    zod_1.z.object({
        eventType: zod_1.z.literal("footballtournament"),
        tournamentFormat: zod_1.z.enum(["league", "knockout"]),
        ...baseEventFields,
    }),
])
    .refine((data) => !!data.venueId || !!data.locationName, {
    message: "Either venueId or locationName must be provided",
});
exports.updateEventSchema = zod_1.z.object({
    venueId: zod_1.z.string().nullable().optional(),
    locationName: zod_1.z.string().nullable().optional(),
    name: zod_1.z.string().min(1).optional(),
    description: zod_1.z.string().optional(),
    sportName: zod_1.z.string().min(1).optional(),
    teamSize: zod_1.z.number().int().positive().optional(),
    maxParticipants: zod_1.z.number().int().positive().optional(),
    dateTime: zod_1.z.string().optional(),
    duration: zod_1.z.number().int().positive().optional(),
    feeAmount: zod_1.z.number().nonnegative().optional(),
    feeType: zod_1.z.enum(["per_person", "per_team", "total"]).optional(),
    isPublic: zod_1.z.boolean().optional(),
    registrationDeadline: zod_1.z.string().optional(),
    status: zod_1.z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});
exports.publicEventFiltersSchema = zod_1.z.object({
    sportName: zod_1.z.string().optional(),
    city: zod_1.z.string().optional(),
    eventType: zod_1.z.enum(["regular", "footballtournament"]).optional(),
    status: zod_1.z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});
exports.createRegistrationSchema = zod_1.z
    .object({
    participationType: zod_1.z.enum(["individual", "team"]),
    footballTeamId: zod_1.z.number().int().positive().optional(),
})
    .refine((data) => data.participationType !== "team" || !!data.footballTeamId, {
    message: "footballTeamId is required for team registrations",
});
exports.processRegistrationSchema = zod_1.z.object({
    status: zod_1.z.enum(["accepted", "rejected"]),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=event.js.map