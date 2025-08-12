"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createfootballMatchBaseSchema = exports.footballTeamCreate = exports.footballProfileRegister = exports.basicOnboardingInfo = void 0;
const zod_1 = require("zod");
exports.basicOnboardingInfo = zod_1.z.object({
    firstname: zod_1.z.string(),
    lastname: zod_1.z.string(),
    dob: zod_1.z.string(),
    contact: zod_1.z.string(),
    city: zod_1.z.string(),
    email: zod_1.z.string().email()
});
exports.footballProfileRegister = zod_1.z.object({
    userId: zod_1.z.number(),
    role: zod_1.z.string(),
    experience: zod_1.z.string(),
    nickname: zod_1.z.string()
});
exports.footballTeamCreate = zod_1.z.object({
    name: zod_1.z.string(),
    location: zod_1.z.string(),
    createdByUserId: zod_1.z.number(),
    maxPlayers: zod_1.z.number(),
    playerIds: zod_1.z.array(zod_1.z.number())
});
exports.createfootballMatchBaseSchema = zod_1.z.object({
    location: zod_1.z.string(),
    playersPerTeam: zod_1.z.number(),
    allowedSubs: zod_1.z.number(),
    extraTime: zod_1.z.boolean(),
    homeTeamId: zod_1.z.number(),
    awayTeamId: zod_1.z.number(),
    referees: zod_1.z.array(zod_1.z.string()),
});
//# sourceMappingURL=index.js.map