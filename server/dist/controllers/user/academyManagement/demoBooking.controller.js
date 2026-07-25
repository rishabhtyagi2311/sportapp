"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserDemoBookingController = void 0;
const demoBooking_1 = require("../../../services/user/academyManagement/demoBooking");
const academy_1 = require("../../../types/user/academy");
class UserDemoBookingController {
    static async create(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = academy_1.createDemoBookingSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid demo booking data", error: parsed.error.issues });
            }
            const booking = await demoBooking_1.UserDemoBookingService.createDemoBooking(parentId, parsed.data);
            return res.status(201).json({ success: true, message: "Demo booking requested", data: booking });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating demo booking" });
        }
    }
    static async list(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const bookings = await demoBooking_1.UserDemoBookingService.getMyDemoBookings(parentId);
            return res.status(200).json({ success: true, data: bookings });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching demo bookings" });
        }
    }
    static async cancel(req, res) {
        try {
            const parentId = req.user?.id;
            const { bookingId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const booking = await demoBooking_1.UserDemoBookingService.cancelDemoBooking(parentId, bookingId);
            return res.status(200).json({ success: true, message: "Demo booking cancelled", data: booking });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error cancelling demo booking" });
        }
    }
}
exports.UserDemoBookingController = UserDemoBookingController;
//# sourceMappingURL=demoBooking.controller.js.map