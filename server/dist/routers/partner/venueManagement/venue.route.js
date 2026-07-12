"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const venue_controller_1 = require("../../../controllers/partner/venueManagement/venue.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/venues', auth_middleware_1.authenticatePartner, venue_controller_1.VenueController.getMyVenues);
router.post('/venues', auth_middleware_1.authenticatePartner, venue_controller_1.VenueController.create);
router.get('/venues/:venueId', auth_middleware_1.authenticatePartner, venue_controller_1.VenueController.getById);
router.put('/venues/:venueId', auth_middleware_1.authenticatePartner, venue_controller_1.VenueController.update);
router.delete('/venues/:venueId', auth_middleware_1.authenticatePartner, venue_controller_1.VenueController.remove);
exports.default = router;
//# sourceMappingURL=venue.route.js.map