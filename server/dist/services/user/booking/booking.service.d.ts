export declare class BookingService {
    static createBooking(userId: number, data: {
        venueId: string;
        slotId: string;
        participants?: number;
    }): Promise<{
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
    static getMyBookings(userId: number): Promise<any[]>;
    static cancelBooking(userId: number, bookingId: string): Promise<{
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
}
//# sourceMappingURL=booking.service.d.ts.map