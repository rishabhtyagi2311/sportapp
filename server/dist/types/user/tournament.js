"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startFixtureMatchSchema = exports.createTournamentSchema = void 0;
const zod_1 = require("zod");
const match_1 = require("./match");
exports.createTournamentSchema = zod_1.z
    .object({
    name: zod_1.z.string().min(1),
    description: zod_1.z.string().optional(),
    format: zod_1.z.enum(["league", "knockout"]),
    teamIds: zod_1.z.array(zod_1.z.number().int().positive()).min(2),
    matchesPerPair: zod_1.z.number().int().positive().optional(),
    extraTimeAllowed: zod_1.z.boolean().default(false),
    playersPerTeam: zod_1.z.number().int().positive(),
    allowedSubs: zod_1.z.number().int().nonnegative(),
    venueName: zod_1.z.string().optional(),
})
    .refine((data) => {
    if (data.format !== "knockout")
        return true;
    const n = data.teamIds.length;
    return n >= 2 && (n & (n - 1)) === 0;
}, { message: "Knockout tournaments require a power-of-2 number of teams (2, 4, 8, 16, ...)" });
exports.startFixtureMatchSchema = zod_1.z.object({
    duration: zod_1.z.number().int().positive(),
    homeRoster: match_1.rosterSchema,
    awayRoster: match_1.rosterSchema,
    referees: zod_1.z.array(zod_1.z.string()).default([]),
});
//# sourceMappingURL=tournament.js.map