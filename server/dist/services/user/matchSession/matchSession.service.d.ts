export declare class UserMatchSessionService {
    static listAvailable(filters?: {
        venueId?: string;
        date?: string;
    }): Promise<any[]>;
    static getById(sessionId: string): Promise<any>;
    static getMySessions(userId: number): Promise<any[]>;
    static joinSession(userId: number, sessionId: string): Promise<any>;
    static leaveSession(userId: number, sessionId: string): Promise<any>;
}
//# sourceMappingURL=matchSession.service.d.ts.map