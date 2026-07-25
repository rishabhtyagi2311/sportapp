"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const booking_controller_1 = require("../../../controllers/user/booking/booking.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/bookings", auth_middleware_1.authenticateUser, booking_controller_1.UserBookingController.getMine);
router.post("/bookings", auth_middleware_1.authenticateUser, booking_controller_1.UserBookingController.create);
router.patch("/bookings/:bookingId/cancel", auth_middleware_1.authenticateUser, booking_controller_1.UserBookingController.cancel);
exports.default = router;
//# sourceMappingURL=booking.route.js.map