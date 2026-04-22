import { Request, Response } from 'express';
import { VenueService } from '../../../services/partner/venueManagement/generateSlots';

export class VenueController {
  static async create(req: Request, res: Response) {
    try {
      // The body comes directly from your Zustand store submitDraftVenue() call
      const venue = await VenueService.createVenue(req.body);
      
      return res.status(201).json({
        success: true,
        data: venue,
      });
    } catch (error: any) {
      console.error('Create Venue Error:', error);
      return res.status(500).json({
        success: false,
        message: error.message || 'Internal Server Error',
      });
    }
  }
}