export declare class ChildProfileService {
    static mapChildProfileForClient(profile: any): {
        id: any;
        parentId: any;
        childName: any;
        childAge: any;
        motherName: any;
        fatherName: any;
        fatherContact: any;
        address: any;
        city: any;
        createdAt: any;
    };
    static createChildProfile(parentId: number, data: any): Promise<{
        id: any;
        parentId: any;
        childName: any;
        childAge: any;
        motherName: any;
        fatherName: any;
        fatherContact: any;
        address: any;
        city: any;
        createdAt: any;
    }>;
    static getMyChildProfiles(parentId: number): Promise<{
        id: any;
        parentId: any;
        childName: any;
        childAge: any;
        motherName: any;
        fatherName: any;
        fatherContact: any;
        address: any;
        city: any;
        createdAt: any;
    }[]>;
    static updateChildProfile(parentId: number, profileId: string, data: any): Promise<{
        id: any;
        parentId: any;
        childName: any;
        childAge: any;
        motherName: any;
        fatherName: any;
        fatherContact: any;
        address: any;
        city: any;
        createdAt: any;
    }>;
    static deleteChildProfile(parentId: number, profileId: string): Promise<void>;
}
//# sourceMappingURL=childProfile.d.ts.map