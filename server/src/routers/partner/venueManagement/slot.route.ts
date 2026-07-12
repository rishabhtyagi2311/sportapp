import { Router } from 'express';
import { SlotController } from '../../../controllers/partner/venueManagement/slot.controller';
import { authenticatePartner } from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/venues/:venueId/slots', authenticatePartner, SlotController.getSlots);
router.post('/venues/:venueId/slots/generate', authenticatePartner, SlotController.generateSlots);
router.patch('/slots/:slotId', authenticatePartner, SlotController.updateSlot);
router.post('/slots/blocks', authenticatePartner, SlotController.createBlock);
router.delete('/slots/blocks/:blockId', authenticatePartner, SlotController.removeBlock);
router.get('/venues/:venueId/bookings', authenticatePartner, SlotController.getBookings);
router.patch('/venues/:venueId/bookings/:bookingId/cancel', authenticatePartner, SlotController.cancelBooking);
router.post('/match-sessions', authenticatePartner, SlotController.createMatchSession);
router.get('/venues/:venueId/match-sessions', authenticatePartner, SlotController.getMatchSessions);
router.patch('/venues/:venueId/match-sessions/:sessionId/cancel', authenticatePartner, SlotController.cancelMatchSession);
router.patch('/venues/:venueId/match-sessions/:sessionId/status', authenticatePartner, SlotController.updateMatchSessionStatus);

export default router;
