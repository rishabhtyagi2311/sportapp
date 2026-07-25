"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.footballTeamCreateSchema = exports.footballProfileRegisterSchema = void 0;
const zod_1 = require("zod");
exports.footballProfileRegisterSchema = zod_1.z.object({
    role: zod_1.z.string().min(1),
    nickname: zod_1.z.string().min(1),
    experience: zod_1.z.string().min(1),
});
exports.footballTeamCreateSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    location: zod_1.z.string().min(1),
    maxPlayers: zod_1.z.number().int().positive(),
    playerIds: zod_1.z.array(zod_1.z.number().int().positive()).default([]),
});
//# sourceMappingURL=football.js.map