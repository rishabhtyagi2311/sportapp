import { Router } from 'express';
import { VenueController } from '../../../controllers/partner/venueManagement/venue.controller';
import { authenticatePartner } from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/my-venues', authenticatePartner, VenueController.getMyVenues);

// Venue creation also needs this to know which partner to link to
router.post('/', authenticatePartner, VenueController.create);

export default router;