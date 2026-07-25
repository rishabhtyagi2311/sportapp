import { Router } from "express";
import { UserBookingController } from "../../../controllers/user/booking/booking.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/bookings", authenticateUser, UserBookingController.getMine);
router.post("/bookings", authenticateUser, UserBookingController.create);
router.patch("/bookings/:bookingId/cancel", authenticateUser, UserBookingController.cancel);

export default router;
