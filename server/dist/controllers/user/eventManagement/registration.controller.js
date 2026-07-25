"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventRegistrationController = void 0;
const registration_1 = require("../../../services/user/eventManagement/registration");
const event_1 = require("../../../types/user/event");
class EventRegistrationController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            const { id: eventId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = event_1.createRegistrationSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid registration data", error: parsed.error.issues });
            }
            const registration = await registration_1.EventRegistrationService.createRegistration(userId, eventId, parsed.data);
            return res.status(201).json({ success: true, message: "Registration submitted", data: registration });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error submitting registration" });
        }
    }
    static async listForEvent(req, res) {
        try {
            const userId = req.user?.id;
            const { id: eventId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const registrations = await registration_1.EventRegistrationService.getRegistrationsForEvent(userId, eventId);
            return res.status(200).json({ success: true, data: registrations });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error fetching registrations" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const registrations = await registration_1.EventRegistrationService.getMyRegistrations(userId);
            return res.status(200).json({ success: true, data: registrations });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching your registrations" });
        }
    }
    static async process(req, res) {
        try {
            const userId = req.user?.id;
            const { id: eventId, registrationId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = event_1.processRegistrationSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid request", error: parsed.error.issues });
            }
            const registration = await registration_1.EventRegistrationService.processRegistration(userId, eventId, registrationId, parsed.data);
            return res.status(200).json({ success: true, message: "Registration processed", data: registration });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error processing registration" });
        }
    }
}
exports.EventRegistrationController = EventRegistrationController;
//# sourceMappingURL=registration.controller.js.map