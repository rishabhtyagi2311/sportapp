import { prisma as globalClient } from "../../../index";

function mapDemoBookingForClient(booking: any) {
  const { academy, childProfile, ...rest } = booking;
  return {
    ...rest,
    bookingDate: booking.bookingDate.toISOString().split("T")[0],
    ...(academy ? { academyName: academy.academyName } : {}),
    ...(childProfile ? { childName: childProfile.childName } : {}),
  };
}

export class UserDemoBookingService {
  static async createDemoBooking(parentId: number, data: { childProfileId: string; academyId: string; bookingDate: string }) {
    const childProfile = await globalClient.childProfile.findFirst({
      where: { id: data.childProfileId, parentId },
    });

    if (!childProfile) {
      throw new Error("Child profile not found");
    }

    const academy = await globalClient.academy.findFirst({ where: { id: data.academyId, isActive: true } });

    if (!academy) {
      throw new Error("Academy not found");
    }

    const booking = await globalClient.demoBooking.create({
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

  static async getMyDemoBookings(parentId: number) {
    const bookings = await globalClient.demoBooking.findMany({
      where: { childProfile: { parentId } },
      include: { academy: true, childProfile: true },
      orderBy: { bookingDate: "desc" },
    });

    return bookings.map(mapDemoBookingForClient);
  }

  static async cancelDemoBooking(parentId: number, bookingId: string) {
    const booking = await globalClient.demoBooking.findFirst({
      where: { id: bookingId, childProfile: { parentId } },
    });

    if (!booking) {
      throw new Error("Demo booking not found");
    }

    if (booking.status === "cancelled" || booking.status === "completed") {
      throw new Error(`Demo booking is already ${booking.status}`);
    }

    const updated = await globalClient.demoBooking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
      include: { academy: true, childProfile: true },
    });

    return mapDemoBookingForClient(updated);
  }
}
