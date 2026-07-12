"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotController = void 0;
const slot_service_1 = require("../../../services/partner/venueManagement/slot.service");
class SlotController {
    static async getSlots(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            const { date, startDate, endDate, varietyId, status } = req.query;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const slots = await slot_service_1.SlotService.getSlotsForVenue({
                venueId,
                partnerId,
                date: date,
                startDate: startDate,
                endDate: endDate,
                varietyId: varietyId,
                status: status,
            });
            return res.status(200).json({ success: true, data: slots });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching slots' });
        }
    }
    static async generateSlots(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            const { daysCount, basePrice, startDate } = req.body;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const generatedCount = await slot_service_1.SlotService.generateSlotsForVenue({
                venueId,
                partnerId,
                daysCount,
                basePrice,
                startDate,
            });
            return res.status(200).json({ success: true, message: 'Slots generated successfully', data: { generatedCount } });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error generating slots' });
        }
    }
    static async updateSlot(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { slotId } = req.params;
            const { status, price, reason } = req.body;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const slot = await slot_service_1.SlotService.updateSlot({ slotId, partnerId, status, price, reason });
            return res.status(200).json({ success: true, data: slot });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating slot' });
        }
    }
    static async createBlock(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId, slotId, reason, date } = req.body;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const block = await slot_service_1.SlotService.createBlock({ partnerId, venueId, slotId, reason, date });
            return res.status(201).json({ success: true, data: block });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error creating slot block' });
        }
    }
    static async removeBlock(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { blockId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await slot_service_1.SlotService.removeBlock({ partnerId, blockId });
            return res.status(200).json({ success: true, message: 'Block removed successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error removing block' });
        }
    }
    static async getBookings(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            const { date, status } = req.query;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const bookings = await slot_service_1.SlotService.getBookingsForVenue({
                venueId,
                partnerId,
                date: date,
                status: status,
            });
            return res.status(200).json({ success: true, data: bookings });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching bookings' });
        }
    }
    static async cancelBooking(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId, bookingId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const booking = await slot_service_1.SlotService.cancelBooking({ partnerId, venueId, bookingId });
            return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Error cancelling booking' });
        }
    }
    static async createMatchSession(req, res) {
        try {
            const partnerId = req.partner?.id;
            const body = req.body;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const session = await slot_service_1.SlotService.createMatchSession({ partnerId, ...body });
            return res.status(201).json({ success: true, message: 'Match published successfully', data: session });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error creating match session' });
        }
    }
    static async getMatchSessions(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId } = req.params;
            const { date, status } = req.query;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const sessions = await slot_service_1.SlotService.getMatchSessionsForVenue({
                venueId,
                partnerId,
                date: date,
                status: status,
            });
            return res.status(200).json({ success: true, data: sessions });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching match sessions' });
        }
    }
    static async cancelMatchSession(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId, sessionId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const session = await slot_service_1.SlotService.cancelMatchSession({ partnerId, venueId, sessionId });
            return res.status(200).json({ success: true, message: 'Match session cancelled successfully', data: session });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Error cancelling match session' });
        }
    }
    static async updateMatchSessionStatus(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { venueId, sessionId } = req.params;
            const { status } = req.body;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            if (status !== 'live' && status !== 'completed') {
                return res.status(400).json({ success: false, message: "Status must be 'live' or 'completed'" });
            }
            const session = await slot_service_1.SlotService.setMatchSessionStatus({ partnerId, venueId, sessionId, status });
            return res.status(200).json({ success: true, message: 'Match session status updated successfully', data: session });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || 'Error updating match session status' });
        }
    }
}
exports.SlotController = SlotController;
//# sourceMappingURL=slot.controller.js.map