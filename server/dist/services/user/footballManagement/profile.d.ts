export declare class FootballProfileService {
    static register(userId: number, data: {
        role: string;
        nickname: string;
        experience: string;
    }): Promise<{
        id: any;
        userId: any;
        nickname: any;
        role: any;
        experience: any;
    }>;
    static checkForUser(userId: number): Promise<{
        exists: boolean;
        profile: {
            id: any;
            userId: any;
            nickname: any;
            role: any;
            experience: any;
        } | null;
    }>;
}
//# sourceMappingURL=profile.d.ts.map