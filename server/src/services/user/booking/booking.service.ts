import { prisma as globalClient } from "../../../index";

export class BookingService {
  static async createBooking(userId: number, data: { venueId: string; slotId: string; participants?: number }) {
    const booking = await globalClient.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findFirst({
        where: { id: data.slotId, venueId: data.venueId },
        include: { venue: true },
      });

      if (!slot) {
        throw new Error("Slot not found");
      }

      if (!slot.venue.isActive) {
        throw new Error("Venue is not currently accepting bookings");
      }

      const claimed = await tx.timeSlot.updateMany({
        where: { id: data.slotId, status: "available" },
        data: { status: "booked" },
      });

      if (claimed.count === 0) {
        throw new Error("This slot is no longer available");
      }

      return tx.booking.create({
        data: {
          venueId: data.venueId,
          userId,
          slotId: data.slotId,
          date: slot.date,
          startTime: slot.startTime,
          endTime: slot.endTime,
          totalAmount: slot.price,
          status: "confirmed",
          paymentStatus: "pending",
          bookingType: "venue",
          participants: data.participants ?? 1,
        },
      });
    });

    return booking;
  }

  static async getMyBookings(userId: number) {
    const bookings = await globalClient.booking.findMany({
      where: { userId },
      include: { venue: { select: { name: true } } },
      orderBy: { date: "desc" },
    });

    return bookings.map((booking: any) => {
      const { venue, ...rest } = booking;
      return { ...rest, venueName: venue?.name };
    });
  }

  static async cancelBooking(userId: number, bookingId: string) {
    const booking = await globalClient.booking.findFirst({ where: { id: bookingId, userId } });

    if (!booking) {
      throw new Error("Booking not found");
    }

    if (booking.status === "cancelled") {
      throw new Error("Booking is already cancelled");
    }

    const updated = await globalClient.booking.update({
      where: { id: bookingId },
      data: { status: "cancelled" },
    });

    if (booking.slotId) {
      await globalClient.timeSlot.updateMany({
        where: { id: booking.slotId, status: "booked" },
        data: { status: "available" },
      });
    }

    return updated;
  }
}
