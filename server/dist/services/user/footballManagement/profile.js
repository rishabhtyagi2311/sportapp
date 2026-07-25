"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballProfileService = void 0;
const index_1 = require("../../../index");
function mapProfileForClient(profile) {
    return {
        id: profile.id,
        userId: profile.userId,
        nickname: profile.nickname,
        role: profile.role,
        experience: profile.experience,
    };
}
class FootballProfileService {
    static async register(userId, data) {
        const existing = await index_1.prisma.footballProfile.findUnique({ where: { userId } });
        if (existing) {
            throw new Error("Football profile already exists for this user");
        }
        const profile = await index_1.prisma.footballProfile.create({
            data: { userId, role: data.role, nickname: data.nickname, experience: data.experience },
        });
        return mapProfileForClient(profile);
    }
    static async checkForUser(userId) {
        const profile = await index_1.prisma.footballProfile.findUnique({ where: { userId } });
        return { exists: !!profile, profile: profile ? mapProfileForClient(profile) : null };
    }
}
exports.FootballProfileService = FootballProfileService;
//# sourceMappingURL=profile.js.map