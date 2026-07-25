"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venue_controller_1 = require("../../../controllers/user/venue/venue.controller");
const router = (0, express_1.Router)();
router.get("/venues", venue_controller_1.UserVenueController.list);
router.get("/venues/:venueId", venue_controller_1.UserVenueController.getById);
router.get("/venues/:venueId/slots", venue_controller_1.UserVenueController.getSlots);
exports.default = router;
//# sourceMappingURL=venue.route.js.map