import { z } from "zod";
export declare const footballProfileRegisterSchema: z.ZodObject<{
    role: z.ZodString;
    nickname: z.ZodString;
    experience: z.ZodString;
}, z.core.$strip>;
export declare const footballTeamCreateSchema: z.ZodObject<{
    name: z.ZodString;
    location: z.ZodString;
    maxPlayers: z.ZodNumber;
    playerIds: z.ZodDefault<z.ZodArray<z.ZodNumber>>;
}, z.core.$strip>;
//# sourceMappingURL=football.d.ts.map