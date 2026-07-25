import { prisma as globalClient } from "../../../index";

const teamInclude = {
  createdBy: { include: { user: true } },
  members: { include: { footballProfile: { include: { user: true } } } },
};

export class FootballTeamService {
  static async createTeam(
    userId: number,
    data: { name: string; location: string; maxPlayers: number; playerIds: number[] }
  ) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId } });

    if (!profile) {
      throw new Error("You need a football profile before creating a team");
    }

    const team = await globalClient.footballTeam.create({
      data: { name: data.name, location: data.location, maxPlayers: data.maxPlayers, createdById: profile.id },
    });

    if (data.playerIds.length > 0) {
      await globalClient.footballTeamMember.createMany({
        data: data.playerIds.map((id) => ({ footballProfileId: id, footballTeamId: team.id })),
      });
    }

    return globalClient.footballTeam.findUnique({
      where: { id: team.id },
      include: teamInclude,
    });
  }

  static async getMyTeams(userId: number) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId }, select: { id: true } });

    if (!profile) {
      throw new Error("Football profile not found");
    }

    return globalClient.footballTeam.findMany({
      where: {
        OR: [{ createdById: profile.id }, { members: { some: { footballProfileId: profile.id } } }],
      },
      include: teamInclude,
    });
  }

  static async getAllPlayers() {
    return globalClient.footballProfile.findMany({
      select: { id: true, userId: true, nickname: true, role: true, experience: true },
    });
  }

  static async getAllTeams() {
    return globalClient.footballTeam.findMany({
      include: teamInclude,
      orderBy: { name: "asc" },
    });
  }

  static async getTeamById(teamId: number) {
    return globalClient.footballTeam.findUnique({
      where: { id: teamId },
      include: teamInclude,
    });
  }

  static async addMember(userId: number, teamId: number, playerId: number) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId } });

    if (!profile) {
      throw new Error("Football profile not found");
    }

    const team = await globalClient.footballTeam.findFirst({ where: { id: teamId, createdById: profile.id } });

    if (!team) {
      throw new Error("Team not found or not owned by you");
    }

    await globalClient.footballTeamMember.create({
      data: { footballProfileId: playerId, footballTeamId: teamId },
    });

    return globalClient.footballTeam.findUnique({
      where: { id: teamId },
      include: teamInclude,
    });
  }
}
