import { Router } from 'express';
import { VenueController } from '../../../controllers/partner/venueManagement/venue.controller';

const router = Router();

router.post('/', VenueController.create);

export default router;