import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { VenueService } from '../../../services/partner/venueManagement/venue';

export class VenueController {
  /**
   * POST /api/venues
   * Creates a new venue and generates 30 days of slots
   * Strictly linked to the authenticated partner
   */
  static async create(req: AuthRequest, res: Response) {
    try {
      // 1. Extract the partnerId from the JWT (verified by middleware)
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(401).json({ 
          success: false, 
          message: "Unauthorized: Partner ID missing from token" 
        });
      }

      // 2. Pass req.body and the partnerId to the service
      // The service now handles the atomic transaction
      const venue = await VenueService.createVenue(req.body, partnerId);
      
      return res.status(201).json({
        success: true,
        message: "Venue created and slots generated successfully",
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

  /**
   * GET /api/venues/my-venues
   * Fetches all venues owned by the current authenticated partner
   */
  static async getMyVenues(req: AuthRequest, res: Response) {
    try {
      // The ID is extracted from the JWT, making it impossible to spoof
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(400).json({ 
          success: false, 
          message: "Partner identification failed" 
        });
      }

      const venues = await VenueService.getVenuesByPartner(partnerId);
      
      return res.status(200).json({
        success: true,
        count: venues.length,
        data: venues
      });
    } catch (error: any) {
      console.error('Fetch Venues Error:', error);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching venues", 
        error: error.message 
      });
    }
  }
}