export declare class SlotService {
    static getSlotsForVenue(params: {
        venueId: string;
        partnerId: string;
        date?: string;
        startDate?: string;
        endDate?: string;
        varietyId?: string;
        status?: string;
    }): Promise<{
        date: Date;
        id: string;
        venueId: string;
        startTime: string;
        endTime: string;
        price: number;
        varietyId: string;
        varietyName: string;
        status: string;
    }[]>;
    static generateSlotsForVenue(params: {
        venueId: string;
        partnerId: string;
        daysCount?: number;
        basePrice?: number;
        startDate?: string;
    }): Promise<number>;
    static updateSlot(params: {
        slotId: string;
        partnerId: string;
        status?: string;
        price?: number;
        reason?: string;
    }): Promise<{
        date: Date;
        id: string;
        venueId: string;
        startTime: string;
        endTime: string;
        price: number;
        varietyId: string;
        varietyName: string;
        status: string;
    }>;
    static createBlock(params: {
        partnerId: string;
        venueId: string;
        slotId: string;
        reason: string;
        date?: string;
    }): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        createdById: string;
        venueId: string;
        slotId: string;
        reason: string;
    }>;
    static removeBlock(params: {
        partnerId: string;
        blockId: string;
    }): Promise<void>;
    static getBookingsForVenue(params: {
        venueId: string;
        partnerId: string;
        date?: string;
        status?: string;
    }): Promise<{
        guestDetails: {
            name: string;
            phone: string;
        };
        userId: string | null;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        startTime: string;
        endTime: string;
        status: string;
        slotId: string | null;
        totalAmount: number;
        paymentStatus: string;
        bookingType: string;
        participants: number | null;
        guestName: string | null;
        guestPhone: string | null;
    }[]>;
    static cancelBooking(params: {
        partnerId: string;
        venueId: string;
        bookingId: string;
    }): Promise<{
        guestDetails: {
            name: string;
            phone: string;
        };
        userId: string | null;
        date: Date;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        venueId: string;
        startTime: string;
        endTime: string;
        status: string;
        slotId: string | null;
        totalAmount: number;
        paymentStatus: string;
        bookingType: string;
        participants: number | null;
        guestName: string | null;
        guestPhone: string | null;
    }>;
    static createMatchSession(params: {
        partnerId: string;
        venueId: string;
        slotId: string;
        date: string;
        startTime: string;
        endTime: string;
        sport: string;
        totalPlayers: number;
        minPlayersForLive: number;
        pricePerPerson: number;
        skillLevel: string;
        description?: string;
    }): Promise<any>;
    static getMatchSessionsForVenue(params: {
        venueId: string;
        partnerId: string;
        date?: string;
        status?: string;
    }): Promise<any[]>;
    static cancelMatchSession(params: {
        partnerId: string;
        venueId: string;
        sessionId: string;
    }): Promise<any>;
    static setMatchSessionStatus(params: {
        partnerId: string;
        venueId: string;
        sessionId: string;
        status: 'live' | 'completed';
    }): Promise<any>;
}
//# sourceMappingURL=slot.service.d.ts.map