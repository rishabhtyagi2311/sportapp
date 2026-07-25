import { Router } from "express";
import {
  UserAcademyController,
  ChildProfileController,
  EnrollmentController,
  StudentRecordsController,
} from "../../../controllers/user/academyManagement/academy.controller";
import { UserDemoBookingController } from "../../../controllers/user/academyManagement/demoBooking.controller";
import { ReviewController } from "../../../controllers/user/academyManagement/review.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/academies", UserAcademyController.list);
router.get("/academies/:academyId", UserAcademyController.getById);
router.get("/academies/:academyId/announcements", UserAcademyController.getAnnouncements);
router.get("/academies/:academyId/reviews", ReviewController.listForAcademy);

router.post("/child-profiles", authenticateUser, ChildProfileController.create);
router.get("/child-profiles", authenticateUser, ChildProfileController.list);
router.put("/child-profiles/:profileId", authenticateUser, ChildProfileController.update);
router.delete("/child-profiles/:profileId", authenticateUser, ChildProfileController.remove);

router.post("/enrollments", authenticateUser, EnrollmentController.create);
router.get("/enrollments", authenticateUser, EnrollmentController.list);
router.patch("/enrollments/:studentId/withdraw", authenticateUser, EnrollmentController.withdraw);

router.get("/students/:studentId/attendance", authenticateUser, StudentRecordsController.getAttendance);
router.get("/students/:studentId/certificates", authenticateUser, StudentRecordsController.getCertificates);

router.post("/demo-bookings", authenticateUser, UserDemoBookingController.create);
router.get("/demo-bookings", authenticateUser, UserDemoBookingController.list);
router.patch("/demo-bookings/:bookingId/cancel", authenticateUser, UserDemoBookingController.cancel);

router.post("/reviews", authenticateUser, ReviewController.create);
router.get("/reviews/mine", authenticateUser, ReviewController.mine);

export default router;
