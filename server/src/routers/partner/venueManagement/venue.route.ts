import { Router } from 'express';
import { VenueController } from '../../../controllers/partner/venueManagement/venue.controller';
import { authenticatePartner } from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/venues', authenticatePartner, VenueController.getMyVenues);
router.post('/venues', authenticatePartner, VenueController.create);
router.get('/venues/:venueId', authenticatePartner, VenueController.getById);
router.put('/venues/:venueId', authenticatePartner, VenueController.update);
router.delete('/venues/:venueId', authenticatePartner, VenueController.remove);

export default router;