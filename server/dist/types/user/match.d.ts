import { z } from "zod";
export declare const rosterSchema: z.ZodObject<{
    startingXI: z.ZodArray<z.ZodNumber>;
    bench: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
    captainId: z.ZodNumber;
    subsUsed: z.ZodDefault<z.ZodNumber>;
}, z.core.$strip>;
export declare const createMatchSchema: z.ZodObject<{
    homeTeamId: z.ZodNumber;
    awayTeamId: z.ZodNumber;
    venueName: z.ZodOptional<z.ZodString>;
    playersPerTeam: z.ZodNumber;
    allowedSubs: z.ZodNumber;
    extraTimeAllowed: z.ZodDefault<z.ZodBoolean>;
    duration: z.ZodNumber;
    homeRoster: z.ZodObject<{
        startingXI: z.ZodArray<z.ZodNumber>;
        bench: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
        captainId: z.ZodNumber;
        subsUsed: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    awayRoster: z.ZodObject<{
        startingXI: z.ZodArray<z.ZodNumber>;
        bench: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
        captainId: z.ZodNumber;
        subsUsed: z.ZodDefault<z.ZodNumber>;
    }, z.core.$strip>;
    referees: z.ZodDefault<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const addMatchEventSchema: z.ZodObject<{
    teamId: z.ZodNumber;
    playerId: z.ZodOptional<z.ZodNumber>;
    relatedPlayerId: z.ZodOptional<z.ZodNumber>;
    eventType: z.ZodString;
    eventSubType: z.ZodOptional<z.ZodString>;
    minute: z.ZodNumber;
    seconds: z.ZodDefault<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updatePossessionSchema: z.ZodObject<{
    teamId: z.ZodNumber;
    currentSeconds: z.ZodNumber;
}, z.core.$strip>;
export declare const endMatchSchema: z.ZodObject<{
    penaltyHomeScore: z.ZodOptional<z.ZodNumber>;
    penaltyAwayScore: z.ZodOptional<z.ZodNumber>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=match.d.ts.map