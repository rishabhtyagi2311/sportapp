import { Router } from "express";
import { UserVenueController } from "../../../controllers/user/venue/venue.controller";

const router = Router();

router.get("/venues", UserVenueController.list);
router.get("/venues/:venueId", UserVenueController.getById);
router.get("/venues/:venueId/slots", UserVenueController.getSlots);

export default router;
