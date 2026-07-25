export declare class UserDemoBookingService {
    static createDemoBooking(parentId: number, data: {
        childProfileId: string;
        academyId: string;
        bookingDate: string;
    }): Promise<any>;
    static getMyDemoBookings(parentId: number): Promise<any[]>;
    static cancelDemoBooking(parentId: number, bookingId: string): Promise<any>;
}
//# sourceMappingURL=demoBooking.d.ts.map