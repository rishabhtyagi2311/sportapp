"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDemoBookingService = void 0;
const index_1 = require("../../../index");
function mapDemoBookingForClient(booking) {
    const { academy, childProfile, ...rest } = booking;
    return {
        ...rest,
        bookingDate: booking.bookingDate.toISOString().split("T")[0],
        ...(academy ? { academyName: academy.academyName } : {}),
        ...(childProfile ? { childName: childProfile.childName } : {}),
    };
}
class UserDemoBookingService {
    static async createDemoBooking(parentId, data) {
        const childProfile = await index_1.prisma.childProfile.findFirst({
            where: { id: data.childProfileId, parentId },
        });
        if (!childProfile) {
            throw new Error("Child profile not found");
        }
        const academy = await index_1.prisma.academy.findFirst({ where: { id: data.academyId, isActive: true } });
        if (!academy) {
            throw new Error("Academy not found");
        }
        const booking = await index_1.prisma.demoBooking.create({
            data: {
                childProfileId: data.childProfileId,
                academyId: data.academyId,
                bookingDate: new Date(data.bookingDate),
                status: "pending",
            },
            include: { academy: true, childProfile: true },
        });
        return mapDemoBookingForClient(booking);
    }
    static async getMyDemoBookings(parentId) {
        const bookings = await index_1.prisma.demoBooking.findMany({
            where: { childProfile: { parentId } },
            include: { academy: true, childProfile: true },
            orderBy: { bookingDate: "desc" },
        });
        return bookings.map(mapDemoBookingForClient);
    }
    static async cancelDemoBooking(parentId, bookingId) {
        const booking = await index_1.prisma.demoBooking.findFirst({
            where: { id: bookingId, childProfile: { parentId } },
        });
        if (!booking) {
            throw new Error("Demo booking not found");
        }
        if (booking.status === "cancelled" || booking.status === "completed") {
            throw new Error(`Demo booking is already ${booking.status}`);
        }
        const updated = await index_1.prisma.demoBooking.update({
            where: { id: bookingId },
            data: { status: "cancelled" },
            include: { academy: true, childProfile: true },
        });
        return mapDemoBookingForClient(updated);
    }
}
exports.UserDemoBookingService = UserDemoBookingService;
//# sourceMappingURL=demoBooking.js.map