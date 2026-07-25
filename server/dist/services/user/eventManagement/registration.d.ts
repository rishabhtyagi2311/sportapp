export declare class EventRegistrationService {
    static createRegistration(userId: number, eventId: string, data: {
        participationType: "individual" | "team";
        footballTeamId?: number;
    }): Promise<any>;
    static getMyRegistrations(userId: number): Promise<any[]>;
    static getRegistrationsForEvent(userId: number, eventId: string): Promise<any[]>;
    static processRegistration(userId: number, eventId: string, registrationId: string, data: {
        status: "accepted" | "rejected";
        notes?: string;
    }): Promise<any>;
}
//# sourceMappingURL=registration.d.ts.map