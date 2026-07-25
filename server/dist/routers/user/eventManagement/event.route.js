"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const event_controller_1 = require("../../../controllers/user/eventManagement/event.controller");
const registration_controller_1 = require("../../../controllers/user/eventManagement/registration.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get("/events", event_controller_1.EventController.list);
router.get("/events/mine", auth_middleware_1.authenticateUser, event_controller_1.EventController.mine);
router.get("/registrations/mine", auth_middleware_1.authenticateUser, registration_controller_1.EventRegistrationController.mine);
router.get("/events/:id", event_controller_1.EventController.getById);
router.post("/events", auth_middleware_1.authenticateUser, event_controller_1.EventController.create);
router.put("/events/:id", auth_middleware_1.authenticateUser, event_controller_1.EventController.update);
router.delete("/events/:id", auth_middleware_1.authenticateUser, event_controller_1.EventController.remove);
router.post("/events/:id/registrations", auth_middleware_1.authenticateUser, registration_controller_1.EventRegistrationController.create);
router.get("/events/:id/registrations", auth_middleware_1.authenticateUser, registration_controller_1.EventRegistrationController.listForEvent);
router.patch("/events/:id/registrations/:registrationId", auth_middleware_1.authenticateUser, registration_controller_1.EventRegistrationController.process);
exports.default = router;
//# sourceMappingURL=event.route.js.map