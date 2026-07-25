import { Router } from "express";
import { EventController } from "../../../controllers/user/eventManagement/event.controller";
import { EventRegistrationController } from "../../../controllers/user/eventManagement/registration.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/events", EventController.list);
router.get("/events/mine", authenticateUser, EventController.mine);
router.get("/registrations/mine", authenticateUser, EventRegistrationController.mine);
router.get("/events/:id", EventController.getById);
router.post("/events", authenticateUser, EventController.create);
router.put("/events/:id", authenticateUser, EventController.update);
router.delete("/events/:id", authenticateUser, EventController.remove);

router.post("/events/:id/registrations", authenticateUser, EventRegistrationController.create);
router.get("/events/:id/registrations", authenticateUser, EventRegistrationController.listForEvent);
router.patch("/events/:id/registrations/:registrationId", authenticateUser, EventRegistrationController.process);

export default router;
