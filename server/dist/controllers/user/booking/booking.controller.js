"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserBookingController = void 0;
const booking_service_1 = require("../../../services/user/booking/booking.service");
const booking_1 = require("../../../types/user/booking");
class UserBookingController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = booking_1.createBookingSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid booking data", error: parsed.error.issues });
            }
            const booking = await booking_service_1.BookingService.createBooking(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Booking confirmed", data: booking });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating booking" });
        }
    }
    static async getMine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const bookings = await booking_service_1.BookingService.getMyBookings(userId);
            return res.status(200).json({ success: true, data: bookings });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching bookings" });
        }
    }
    static async cancel(req, res) {
        try {
            const userId = req.user?.id;
            const { bookingId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const booking = await booking_service_1.BookingService.cancelBooking(userId, bookingId);
            return res.status(200).json({ success: true, message: "Booking cancelled successfully", data: booking });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error cancelling booking" });
        }
    }
}
exports.UserBookingController = UserBookingController;
//# sourceMappingURL=booking.controller.js.map