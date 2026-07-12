"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slot_controller_1 = require("../../../controllers/partner/venueManagement/slot.controller");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.get('/venues/:venueId/slots', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.getSlots);
router.post('/venues/:venueId/slots/generate', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.generateSlots);
router.patch('/slots/:slotId', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.updateSlot);
router.post('/slots/blocks', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.createBlock);
router.delete('/slots/blocks/:blockId', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.removeBlock);
router.get('/venues/:venueId/bookings', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.getBookings);
router.patch('/venues/:venueId/bookings/:bookingId/cancel', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.cancelBooking);
router.post('/match-sessions', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.createMatchSession);
router.get('/venues/:venueId/match-sessions', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.getMatchSessions);
router.patch('/venues/:venueId/match-sessions/:sessionId/cancel', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.cancelMatchSession);
router.patch('/venues/:venueId/match-sessions/:sessionId/status', auth_middleware_1.authenticatePartner, slot_controller_1.SlotController.updateMatchSessionStatus);
exports.default = router;
//# sourceMappingURL=slot.route.js.map