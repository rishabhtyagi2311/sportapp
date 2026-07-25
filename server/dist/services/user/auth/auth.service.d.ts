export declare class UserAuthService {
    private static signToken;
    private static toPublicUser;
    static register(data: {
        firstname: string;
        lastname: string;
        email: string;
        contact: string;
        city: string;
        dob: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            firstname: string;
            lastname: string;
            email: string;
            contact: string;
            city: string;
            dob: string;
        };
    }>;
    static getById(userId: number): Promise<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        contact: string;
        city: string;
        dob: string;
    }>;
    static login(data: {
        identifier: string;
        password: string;
    }): Promise<{
        token: string;
        user: {
            id: number;
            firstname: string;
            lastname: string;
            email: string;
            contact: string;
            city: string;
            dob: string;
        };
    }>;
    static updateProfile(userId: number, data: {
        firstname?: string;
        lastname?: string;
        email?: string;
        city?: string;
        dob?: string;
    }): Promise<{
        id: number;
        firstname: string;
        lastname: string;
        email: string;
        contact: string;
        city: string;
        dob: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map