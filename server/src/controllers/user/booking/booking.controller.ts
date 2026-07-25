import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { BookingService } from "../../../services/user/booking/booking.service";
import { createBookingSchema } from "../../../types/user/booking";

export class UserBookingController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid booking data", error: parsed.error.issues });
      }

      const booking = await BookingService.createBooking(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Booking confirmed", data: booking });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating booking" });
    }
  }

  static async getMine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const bookings = await BookingService.getMyBookings(userId);

      return res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching bookings" });
    }
  }

  static async cancel(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { bookingId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const booking = await BookingService.cancelBooking(userId, bookingId);

      return res.status(200).json({ success: true, message: "Booking cancelled successfully", data: booking });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error cancelling booking" });
    }
  }
}
