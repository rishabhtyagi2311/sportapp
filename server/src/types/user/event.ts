import { z } from "zod";

const baseEventFields = {
  venueId: z.string().optional(),
  locationName: z.string().optional(),
  name: z.string().min(1),
  description: z.string().optional(),
  sportName: z.string().min(1),
  participationType: z.enum(["individual", "team"]),
  teamSize: z.number().int().positive().optional(),
  maxParticipants: z.number().int().positive(),
  dateTime: z.string().min(1),
  duration: z.number().int().positive(),
  feeAmount: z.number().nonnegative(),
  feeCurrency: z.string().default("INR"),
  feeType: z.enum(["per_person", "per_team", "total"]),
  isPublic: z.boolean().default(true),
  registrationDeadline: z.string().min(1),
};

export const createEventSchema = z
  .discriminatedUnion("eventType", [
    z.object({ eventType: z.literal("regular"), ...baseEventFields }),
    z.object({
      eventType: z.literal("footballtournament"),
      tournamentFormat: z.enum(["league", "knockout"]),
      ...baseEventFields,
    }),
  ])
  .refine((data) => !!data.venueId || !!data.locationName, {
    message: "Either venueId or locationName must be provided",
  });

export const updateEventSchema = z.object({
  venueId: z.string().nullable().optional(),
  locationName: z.string().nullable().optional(),
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  sportName: z.string().min(1).optional(),
  teamSize: z.number().int().positive().optional(),
  maxParticipants: z.number().int().positive().optional(),
  dateTime: z.string().optional(),
  duration: z.number().int().positive().optional(),
  feeAmount: z.number().nonnegative().optional(),
  feeType: z.enum(["per_person", "per_team", "total"]).optional(),
  isPublic: z.boolean().optional(),
  registrationDeadline: z.string().optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});

export const publicEventFiltersSchema = z.object({
  sportName: z.string().optional(),
  city: z.string().optional(),
  eventType: z.enum(["regular", "footballtournament"]).optional(),
  status: z.enum(["upcoming", "ongoing", "completed", "cancelled"]).optional(),
});

export const createRegistrationSchema = z
  .object({
    participationType: z.enum(["individual", "team"]),
    footballTeamId: z.number().int().positive().optional(),
  })
  .refine((data) => data.participationType !== "team" || !!data.footballTeamId, {
    message: "footballTeamId is required for team registrations",
  });

export const processRegistrationSchema = z.object({
  status: z.enum(["accepted", "rejected"]),
  notes: z.string().optional(),
});
