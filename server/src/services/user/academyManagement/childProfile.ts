import { prisma as globalClient } from "../../../index";

export class ChildProfileService {
  static mapChildProfileForClient(profile: any) {
    return {
      id: profile.id,
      parentId: profile.parentId,
      childName: profile.childName,
      childAge: profile.childAge,
      motherName: profile.motherName || undefined,
      fatherName: profile.fatherName,
      fatherContact: profile.fatherContact || undefined,
      address: profile.address || undefined,
      city: profile.city || undefined,
      createdAt: profile.createdAt?.toISOString?.() ?? profile.createdAt,
    };
  }

  static async createChildProfile(parentId: number, data: any) {
    const profile = await globalClient.childProfile.create({
      data: {
        parentId,
        childName: data.childName,
        childAge: data.childAge,
        motherName: data.motherName,
        fatherName: data.fatherName,
        fatherContact: data.fatherContact,
        address: data.address,
        city: data.city,
      },
    });

    return this.mapChildProfileForClient(profile);
  }

  static async getMyChildProfiles(parentId: number) {
    const profiles = await globalClient.childProfile.findMany({
      where: { parentId },
      orderBy: { createdAt: 'desc' },
    });

    return profiles.map((profile) => this.mapChildProfileForClient(profile));
  }

  static async updateChildProfile(parentId: number, profileId: string, data: any) {
    const existing = await globalClient.childProfile.findFirst({ where: { id: profileId, parentId } });

    if (!existing) {
      throw new Error('Child profile not found');
    }

    const profile = await globalClient.childProfile.update({
      where: { id: profileId },
      data: {
        childName: data.childName,
        childAge: data.childAge,
        motherName: data.motherName,
        fatherName: data.fatherName,
        fatherContact: data.fatherContact,
        address: data.address,
        city: data.city,
      },
    });

    return this.mapChildProfileForClient(profile);
  }

  static async deleteChildProfile(parentId: number, profileId: string) {
    const existing = await globalClient.childProfile.findFirst({ where: { id: profileId, parentId } });

    if (!existing) {
      throw new Error('Child profile not found');
    }

    await globalClient.childProfile.delete({ where: { id: profileId } });
  }
}
