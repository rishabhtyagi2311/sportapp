export declare class AuthService {
    private static signToken;
    private static toPublicPartner;
    static register(data: {
        firstName: string;
        lastName: string;
        contactNumber: string;
        password: string;
        email?: string;
        city?: string;
        dob?: string;
    }): Promise<{
        token: string;
        partner: {
            id: string;
            firstName: string;
            lastName: string;
            contactNumber: string;
            email: string | undefined;
            city: string | undefined;
            dob: string | undefined;
        };
    }>;
    static getById(partnerId: string): Promise<{
        id: string;
        firstName: string;
        lastName: string;
        contactNumber: string;
        email: string | undefined;
        city: string | undefined;
        dob: string | undefined;
    }>;
    static login(data: {
        contactNumber: string;
        password: string;
    }): Promise<{
        token: string;
        partner: {
            id: string;
            firstName: string;
            lastName: string;
            contactNumber: string;
            email: string | undefined;
            city: string | undefined;
            dob: string | undefined;
        };
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map