"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.endMatchSchema = exports.updatePossessionSchema = exports.addMatchEventSchema = exports.createMatchSchema = exports.rosterSchema = void 0;
const zod_1 = require("zod");
exports.rosterSchema = zod_1.z.object({
    startingXI: zod_1.z.array(zod_1.z.number().int().positive()).min(1),
    bench: zod_1.z.array(zod_1.z.number().int().positive()).default([]),
    captainId: zod_1.z.number().int().positive(),
    subsUsed: zod_1.z.number().int().nonnegative().default(0),
});
exports.createMatchSchema = zod_1.z.object({
    homeTeamId: zod_1.z.number().int().positive(),
    awayTeamId: zod_1.z.number().int().positive(),
    venueName: zod_1.z.string().optional(),
    playersPerTeam: zod_1.z.number().int().positive(),
    allowedSubs: zod_1.z.number().int().nonnegative(),
    extraTimeAllowed: zod_1.z.boolean().default(false),
    duration: zod_1.z.number().int().positive(),
    homeRoster: exports.rosterSchema,
    awayRoster: exports.rosterSchema,
    referees: zod_1.z.array(zod_1.z.string()).default([]),
});
exports.addMatchEventSchema = zod_1.z.object({
    teamId: zod_1.z.number().int().positive(),
    playerId: zod_1.z.number().int().positive().optional(),
    relatedPlayerId: zod_1.z.number().int().positive().optional(),
    // 'goal'/'own_goal' affect the score; 'yellow_card'/'red_card'/'substitution' affect
    // end-of-match player stats (see MatchService.endMatch); anything else (offside, foul,
    // corner, save, ...) is stored as a purely informational timeline entry.
    eventType: zod_1.z.string().min(1),
    eventSubType: zod_1.z.string().optional(),
    minute: zod_1.z.number().int().nonnegative(),
    seconds: zod_1.z.number().int().nonnegative().default(0),
    notes: zod_1.z.string().optional(),
});
exports.updatePossessionSchema = zod_1.z.object({
    teamId: zod_1.z.number().int().positive(),
    currentSeconds: zod_1.z.number().int().nonnegative(),
});
exports.endMatchSchema = zod_1.z.object({
    penaltyHomeScore: zod_1.z.number().int().nonnegative().optional(),
    penaltyAwayScore: zod_1.z.number().int().nonnegative().optional(),
    notes: zod_1.z.string().optional(),
});
//# sourceMappingURL=match.js.map