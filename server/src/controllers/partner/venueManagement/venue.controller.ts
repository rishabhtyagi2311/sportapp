import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { VenueService } from '../../../services/partner/venueManagement/venue';
import { createVenueSchema, updateVenueSchema } from '../../../types/partner/venue';

export class VenueController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(401).json({
          success: false,
          message: 'Unauthorized: Partner ID missing from token',
        });
      }

      const parsed = createVenueSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue data',
          error: parsed.error.issues,
        });
      }

      const venue = await VenueService.createVenue(parsed.data, partnerId);

      return res.status(201).json({
        success: true,
        message: 'Venue created and slots generated successfully',
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

  static async getMyVenues(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(400).json({
          success: false,
          message: 'Partner identification failed',
        });
      }

      const venues = await VenueService.getVenuesByPartner(partnerId);

      return res.status(200).json({
        success: true,
        count: venues.length,
        data: venues,
      });
    } catch (error: any) {
      console.error('Fetch Venues Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching venues',
        error: error.message,
      });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const venue = await VenueService.getVenueById(venueId, partnerId);

      if (!venue) {
        return res.status(404).json({ success: false, message: 'Venue not found' });
      }

      return res.status(200).json({ success: true, data: venue });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching venue' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = updateVenueSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({
          success: false,
          message: 'Invalid venue data',
          error: parsed.error.issues,
        });
      }

      const venue = await VenueService.updateVenue(venueId, partnerId, parsed.data);

      return res.status(200).json({ success: true, message: 'Venue updated successfully', data: venue });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating venue' });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await VenueService.deleteVenue(venueId, partnerId);

      return res.status(200).json({ success: true, message: 'Venue deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error deleting venue' });
    }
  }
}