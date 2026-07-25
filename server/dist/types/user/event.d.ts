import { z } from "zod";
export declare const createEventSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    venueId: z.ZodOptional<z.ZodString>;
    locationName: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sportName: z.ZodString;
    participationType: z.ZodEnum<{
        individual: "individual";
        team: "team";
    }>;
    teamSize: z.ZodOptional<z.ZodNumber>;
    maxParticipants: z.ZodNumber;
    dateTime: z.ZodString;
    duration: z.ZodNumber;
    feeAmount: z.ZodNumber;
    feeCurrency: z.ZodDefault<z.ZodString>;
    feeType: z.ZodEnum<{
        per_person: "per_person";
        per_team: "per_team";
        total: "total";
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    registrationDeadline: z.ZodString;
    eventType: z.ZodLiteral<"regular">;
}, z.core.$strip>, z.ZodObject<{
    venueId: z.ZodOptional<z.ZodString>;
    locationName: z.ZodOptional<z.ZodString>;
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    sportName: z.ZodString;
    participationType: z.ZodEnum<{
        individual: "individual";
        team: "team";
    }>;
    teamSize: z.ZodOptional<z.ZodNumber>;
    maxParticipants: z.ZodNumber;
    dateTime: z.ZodString;
    duration: z.ZodNumber;
    feeAmount: z.ZodNumber;
    feeCurrency: z.ZodDefault<z.ZodString>;
    feeType: z.ZodEnum<{
        per_person: "per_person";
        per_team: "per_team";
        total: "total";
    }>;
    isPublic: z.ZodDefault<z.ZodBoolean>;
    registrationDeadline: z.ZodString;
    eventType: z.ZodLiteral<"footballtournament">;
    tournamentFormat: z.ZodEnum<{
        league: "league";
        knockout: "knockout";
    }>;
}, z.core.$strip>]>;
export declare const updateEventSchema: z.ZodObject<{
    venueId: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    locationName: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    sportName: z.ZodOptional<z.ZodString>;
    teamSize: z.ZodOptional<z.ZodNumber>;
    maxParticipants: z.ZodOptional<z.ZodNumber>;
    dateTime: z.ZodOptional<z.ZodString>;
    duration: z.ZodOptional<z.ZodNumber>;
    feeAmount: z.ZodOptional<z.ZodNumber>;
    feeType: z.ZodOptional<z.ZodEnum<{
        per_person: "per_person";
        per_team: "per_team";
        total: "total";
    }>>;
    isPublic: z.ZodOptional<z.ZodBoolean>;
    registrationDeadline: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        upcoming: "upcoming";
        ongoing: "ongoing";
    }>>;
}, z.core.$strip>;
export declare const publicEventFiltersSchema: z.ZodObject<{
    sportName: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    eventType: z.ZodOptional<z.ZodEnum<{
        regular: "regular";
        footballtournament: "footballtournament";
    }>>;
    status: z.ZodOptional<z.ZodEnum<{
        cancelled: "cancelled";
        completed: "completed";
        upcoming: "upcoming";
        ongoing: "ongoing";
    }>>;
}, z.core.$strip>;
export declare const createRegistrationSchema: z.ZodObject<{
    participationType: z.ZodEnum<{
        individual: "individual";
        team: "team";
    }>;
    footballTeamId: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const processRegistrationSchema: z.ZodObject<{
    status: z.ZodEnum<{
        accepted: "accepted";
        rejected: "rejected";
    }>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=event.d.ts.map