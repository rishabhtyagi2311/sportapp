"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueController = void 0;
const venue_1 = require("../../../services/partner/venueManagement/venue");
const venue_2 = require("../../../types/partner/venue");
class VenueController {
    static async create(req, res) {
        try {
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(401).json({
                    success: false,
                    message: 'Unauthorized: Partner ID missing from token',
                });
            }
            const parsed = venue_2.createVenueSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid venue data',
                    error: parsed.error.issues,
                });
            }
            const venue = await venue_1.VenueService.createVenue(parsed.data, partnerId);
            return res.status(201).json({
                success: true,
                message: 'Venue created and slots generated successfully',
                data: venue,
            });
        }
        catch (error) {
            console.error('Create Venue Error:', error);
            return res.status(500).json({
                success: false,
                message: error.message || 'Internal Server Error',
            });
        }
    }
    static async getMyVenues(req, res) {
        try {
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(400).json({
                    success: false,
                    message: 'Partner identification failed',
                });
            }
            const venues = await venue_1.VenueService.getVenuesByPartner(partnerId);
            return res.status(200).json({
                success: true,
                count: venues.length,
                data: venues,
            });
        }
        catch (error) {
            console.error('Fetch Venues Error:', error);
            return res.status(500).json({
                success: false,
                message: 'Error fetching venues',
                error: error.message,
            });
        }
    }
    static async getById(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const venue = await venue_1.VenueService.getVenueById(venueId, partnerId);
            if (!venue) {
                return res.status(404).json({ success: false, message: 'Venue not found' });
            }
            return res.status(200).json({ success: true, data: venue });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching venue' });
        }
    }
    static async update(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = venue_2.updateVenueSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid venue data',
                    error: parsed.error.issues,
                });
            }
            const venue = await venue_1.VenueService.updateVenue(venueId, partnerId, parsed.data);
            return res.status(200).json({ success: true, message: 'Venue updated successfully', data: venue });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating venue' });
        }
    }
    static async remove(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await venue_1.VenueService.deleteVenue(venueId, partnerId);
            return res.status(200).json({ success: true, message: 'Venue deleted successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error deleting venue' });
        }
    }
}
exports.VenueController = VenueController;
//# sourceMappingURL=venue.controller.js.map