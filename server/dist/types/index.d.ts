import { z } from "zod";
export declare const basicOnboardingInfo: z.ZodObject<{
    firstname: z.ZodString;
    lastname: z.ZodString;
    dob: z.ZodString;
    contact: z.ZodString;
    city: z.ZodString;
    email: z.ZodString;
}, z.core.$strip>;
export declare const footballProfileRegister: z.ZodObject<{
    userId: z.ZodNumber;
    role: z.ZodString;
    experience: z.ZodString;
    nickname: z.ZodString;
}, z.core.$strip>;
export declare const footballTeamCreate: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
    createdByUserId: z.ZodNumber;
    maxPlayers: z.ZodNumber;
    playerIds: z.ZodArray<z.ZodNumber>;
}, z.core.$strip>;
export declare const createfootballMatchBaseSchema: z.ZodObject<{
    location: z.ZodString;
    playersPerTeam: z.ZodNumber;
    allowedSubs: z.ZodNumber;
    extraTime: z.ZodBoolean;
    homeTeamId: z.ZodNumber;
    awayTeamId: z.ZodNumber;
    referees: z.ZodArray<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=index.d.ts.map