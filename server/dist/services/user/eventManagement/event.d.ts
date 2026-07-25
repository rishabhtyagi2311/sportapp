export declare function mapEventForClient(event: any): any;
export declare class EventService {
    static createEvent(userId: number, data: any): Promise<any>;
    static getMyEvents(userId: number): Promise<any[]>;
    static getPublicEvents(filters?: {
        sportName?: string;
        city?: string;
        eventType?: string;
        status?: string;
    }): Promise<any[]>;
    static getEventById(eventId: string): Promise<any>;
    static updateEvent(userId: number, eventId: string, data: any): Promise<any>;
    static deleteEvent(userId: number, eventId: string): Promise<void>;
}
//# sourceMappingURL=event.d.ts.map