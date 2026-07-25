"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserVenueController = void 0;
const venue_1 = require("../../../services/partner/venueManagement/venue");
const slot_service_1 = require("../../../services/partner/venueManagement/slot.service");
const venue_2 = require("../../../types/user/venue");
class UserVenueController {
    static async list(req, res) {
        try {
            const parsed = venue_2.publicVenueFiltersSchema.safeParse(req.query);
            const filters = parsed.success ? parsed.data : {};
            const venues = await venue_1.VenueService.getPublicVenues(filters);
            return res.status(200).json({ success: true, count: venues.length, data: venues });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching venues" });
        }
    }
    static async getById(req, res) {
        try {
            const { venueId } = req.params;
            const venue = await venue_1.VenueService.getPublicVenueById(venueId);
            if (!venue) {
                return res.status(404).json({ success: false, message: "Venue not found" });
            }
            return res.status(200).json({ success: true, data: venue });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching venue" });
        }
    }
    static async getSlots(req, res) {
        try {
            const { venueId } = req.params;
            const { date } = req.query;
            const slots = await slot_service_1.SlotService.getPublicSlotsForVenue({
                venueId,
                date: date,
            });
            return res.status(200).json({ success: true, data: slots });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message || "Error fetching slots" });
        }
    }
}
exports.UserVenueController = UserVenueController;
//# sourceMappingURL=venue.controller.js.map