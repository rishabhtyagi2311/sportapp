import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { UserDemoBookingService } from "../../../services/user/academyManagement/demoBooking";
import { createDemoBookingSchema } from "../../../types/user/academy";

export class UserDemoBookingController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createDemoBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid demo booking data", error: parsed.error.issues });
      }

      const booking = await UserDemoBookingService.createDemoBooking(parentId, parsed.data);

      return res.status(201).json({ success: true, message: "Demo booking requested", data: booking });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating demo booking" });
    }
  }

  static async list(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const bookings = await UserDemoBookingService.getMyDemoBookings(parentId);

      return res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching demo bookings" });
    }
  }

  static async cancel(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { bookingId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const booking = await UserDemoBookingService.cancelDemoBooking(parentId, bookingId);

      return res.status(200).json({ success: true, message: "Demo booking cancelled", data: booking });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error cancelling demo booking" });
    }
  }
}
