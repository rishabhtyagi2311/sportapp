import { Request, Response } from "express";
import { VenueService } from "../../../services/partner/venueManagement/venue";
import { SlotService } from "../../../services/partner/venueManagement/slot.service";
import { publicVenueFiltersSchema } from "../../../types/user/venue";

export class UserVenueController {
  static async list(req: Request, res: Response) {
    try {
      const parsed = publicVenueFiltersSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};

      const venues = await VenueService.getPublicVenues(filters);

      return res.status(200).json({ success: true, count: venues.length, data: venues });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching venues" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { venueId } = req.params;
      const venue = await VenueService.getPublicVenueById(venueId);

      if (!venue) {
        return res.status(404).json({ success: false, message: "Venue not found" });
      }

      return res.status(200).json({ success: true, data: venue });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching venue" });
    }
  }

  static async getSlots(req: Request, res: Response) {
    try {
      const { venueId } = req.params;
      const { date } = req.query;

      const slots = await SlotService.getPublicSlotsForVenue({
        venueId,
        date: date as string | undefined,
      });

      return res.status(200).json({ success: true, data: slots });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || "Error fetching slots" });
    }
  }
}
