import { z } from "zod";
export declare const createTournamentSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    format: z.ZodEnum<{
        league: "league";
        knockout: "knockout";
    }>;
    teamIds: z.ZodArray<z.ZodNumber>;
    matchesPerPair: z.ZodOptional<z.ZodNumber>;
    extraTimeAllowed: z.ZodDefault<z.ZodBoolean>;
    playersPerTeam: z.ZodNumber;
    allowedSubs: z.ZodNumber;
    venueName: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const startFixtureMatchSchema: z.ZodObject<{
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
//# sourceMappingURL=tournament.d.ts.map