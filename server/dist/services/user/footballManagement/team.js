"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballTeamService = void 0;
const index_1 = require("../../../index");
const teamInclude = {
    createdBy: { include: { user: true } },
    members: { include: { footballProfile: { include: { user: true } } } },
};
class FootballTeamService {
    static async createTeam(userId, data) {
        const profile = await index_1.prisma.footballProfile.findUnique({ where: { userId } });
        if (!profile) {
            throw new Error("You need a football profile before creating a team");
        }
        const team = await index_1.prisma.footballTeam.create({
            data: { name: data.name, location: data.location, maxPlayers: data.maxPlayers, createdById: profile.id },
        });
        if (data.playerIds.length > 0) {
            await index_1.prisma.footballTeamMember.createMany({
                data: data.playerIds.map((id) => ({ footballProfileId: id, footballTeamId: team.id })),
            });
        }
        return index_1.prisma.footballTeam.findUnique({
            where: { id: team.id },
            include: teamInclude,
        });
    }
    static async getMyTeams(userId) {
        const profile = await index_1.prisma.footballProfile.findUnique({ where: { userId }, select: { id: true } });
        if (!profile) {
            throw new Error("Football profile not found");
        }
        return index_1.prisma.footballTeam.findMany({
            where: {
                OR: [{ createdById: profile.id }, { members: { some: { footballProfileId: profile.id } } }],
            },
            include: teamInclude,
        });
    }
    static async getAllPlayers() {
        return index_1.prisma.footballProfile.findMany({
            select: { id: true, userId: true, nickname: true, role: true, experience: true },
        });
    }
    static async getAllTeams() {
        return index_1.prisma.footballTeam.findMany({
            include: teamInclude,
            orderBy: { name: "asc" },
        });
    }
    static async getTeamById(teamId) {
        return index_1.prisma.footballTeam.findUnique({
            where: { id: teamId },
            include: teamInclude,
        });
    }
    static async addMember(userId, teamId, playerId) {
        const profile = await index_1.prisma.footballProfile.findUnique({ where: { userId } });
        if (!profile) {
            throw new Error("Football profile not found");
        }
        const team = await index_1.prisma.footballTeam.findFirst({ where: { id: teamId, createdById: profile.id } });
        if (!team) {
            throw new Error("Team not found or not owned by you");
        }
        await index_1.prisma.footballTeamMember.create({
            data: { footballProfileId: playerId, footballTeamId: teamId },
        });
        return index_1.prisma.footballTeam.findUnique({
            where: { id: teamId },
            include: teamInclude,
        });
    }
}
exports.FootballTeamService = FootballTeamService;
//# sourceMappingURL=team.js.map