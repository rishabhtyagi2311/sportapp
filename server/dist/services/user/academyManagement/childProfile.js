"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChildProfileService = void 0;
const index_1 = require("../../../index");
class ChildProfileService {
    static mapChildProfileForClient(profile) {
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
    static async createChildProfile(parentId, data) {
        const profile = await index_1.prisma.childProfile.create({
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
    static async getMyChildProfiles(parentId) {
        const profiles = await index_1.prisma.childProfile.findMany({
            where: { parentId },
            orderBy: { createdAt: 'desc' },
        });
        return profiles.map((profile) => this.mapChildProfileForClient(profile));
    }
    static async updateChildProfile(parentId, profileId, data) {
        const existing = await index_1.prisma.childProfile.findFirst({ where: { id: profileId, parentId } });
        if (!existing) {
            throw new Error('Child profile not found');
        }
        const profile = await index_1.prisma.childProfile.update({
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
    static async deleteChildProfile(parentId, profileId) {
        const existing = await index_1.prisma.childProfile.findFirst({ where: { id: profileId, parentId } });
        if (!existing) {
            throw new Error('Child profile not found');
        }
        await index_1.prisma.childProfile.delete({ where: { id: profileId } });
    }
}
exports.ChildProfileService = ChildProfileService;
//# sourceMappingURL=childProfile.js.map