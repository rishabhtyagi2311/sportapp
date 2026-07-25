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
        id: string;
        status: string;
        venueId: string;
        price: number;
        varietyId: string;
        varietyName: string;
        date: Date;
        startTime: string;
        endTime: string;
    }[]>;
    /** Public, unauthenticated slot lookup — visible only for active venues. */
    static getPublicSlotsForVenue(params: {
        venueId: string;
        date?: string;
    }): Promise<{
        id: string;
        status: string;
        venueId: string;
        price: number;
        varietyId: string;
        varietyName: string;
        date: Date;
        startTime: string;
        endTime: string;
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
        id: string;
        status: string;
        venueId: string;
        price: number;
        varietyId: string;
        varietyName: string;
        date: Date;
        startTime: string;
        endTime: string;
    }>;
    static createBlock(params: {
        partnerId: string;
        venueId: string;
        slotId: string;
        reason: string;
        date?: string;
    }): Promise<{
        id: string;
        venueId: string;
        createdAt: Date;
        updatedAt: Date;
        slotId: string;
        reason: string;
        createdById: string;
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
        id: string;
        status: string;
        venueId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        startTime: string;
        endTime: string;
        slotId: string | null;
        userId: number | null;
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
        id: string;
        status: string;
        venueId: string;
        createdAt: Date;
        updatedAt: Date;
        date: Date;
        startTime: string;
        endTime: string;
        slotId: string | null;
        userId: number | null;
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