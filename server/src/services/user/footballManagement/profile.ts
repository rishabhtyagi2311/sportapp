import { prisma as globalClient } from "../../../index";

function mapProfileForClient(profile: any) {
  return {
    id: profile.id,
    userId: profile.userId,
    nickname: profile.nickname,
    role: profile.role,
    experience: profile.experience,
  };
}

export class FootballProfileService {
  static async register(userId: number, data: { role: string; nickname: string; experience: string }) {
    const existing = await globalClient.footballProfile.findUnique({ where: { userId } });

    if (existing) {
      throw new Error("Football profile already exists for this user");
    }

    const profile = await globalClient.footballProfile.create({
      data: { userId, role: data.role, nickname: data.nickname, experience: data.experience },
    });

    return mapProfileForClient(profile);
  }

  static async checkForUser(userId: number) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId } });

    return { exists: !!profile, profile: profile ? mapProfileForClient(profile) : null };
  }
}
