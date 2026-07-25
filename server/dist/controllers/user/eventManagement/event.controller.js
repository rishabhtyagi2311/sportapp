"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventController = void 0;
const event_1 = require("../../../services/user/eventManagement/event");
const event_2 = require("../../../types/user/event");
class EventController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = event_2.createEventSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
            }
            const event = await event_1.EventService.createEvent(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Event created successfully", data: event });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating event" });
        }
    }
    static async list(req, res) {
        try {
            const parsed = event_2.publicEventFiltersSchema.safeParse(req.query);
            const filters = parsed.success ? parsed.data : {};
            const events = await event_1.EventService.getPublicEvents(filters);
            return res.status(200).json({ success: true, count: events.length, data: events });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching events" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const events = await event_1.EventService.getMyEvents(userId);
            return res.status(200).json({ success: true, data: events });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching your events" });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const event = await event_1.EventService.getEventById(id);
            if (!event) {
                return res.status(404).json({ success: false, message: "Event not found" });
            }
            return res.status(200).json({ success: true, data: event });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching event" });
        }
    }
    static async update(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = event_2.updateEventSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
            }
            const event = await event_1.EventService.updateEvent(userId, id, parsed.data);
            return res.status(200).json({ success: true, message: "Event updated successfully", data: event });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error updating event" });
        }
    }
    static async remove(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await event_1.EventService.deleteEvent(userId, id);
            return res.status(200).json({ success: true, message: "Event deleted successfully" });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error deleting event" });
        }
    }
}
exports.EventController = EventController;
//# sourceMappingURL=event.controller.js.map