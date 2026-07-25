"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserMatchSessionController = void 0;
const matchSession_service_1 = require("../../../services/user/matchSession/matchSession.service");
class UserMatchSessionController {
    static async list(req, res) {
        try {
            const { venueId, date } = req.query;
            const sessions = await matchSession_service_1.UserMatchSessionService.listAvailable({
                venueId: venueId,
                date: date,
            });
            return res.status(200).json({ success: true, data: sessions });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching match sessions" });
        }
    }
    static async getById(req, res) {
        try {
            const { sessionId } = req.params;
            const session = await matchSession_service_1.UserMatchSessionService.getById(sessionId);
            return res.status(200).json({ success: true, data: session });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message || "Match session not found" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const sessions = await matchSession_service_1.UserMatchSessionService.getMySessions(userId);
            return res.status(200).json({ success: true, data: sessions });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching match sessions" });
        }
    }
    static async join(req, res) {
        try {
            const userId = req.user?.id;
            const { sessionId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const session = await matchSession_service_1.UserMatchSessionService.joinSession(userId, sessionId);
            return res.status(200).json({ success: true, message: "Joined match session", data: session });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error joining match session" });
        }
    }
    static async leave(req, res) {
        try {
            const userId = req.user?.id;
            const { sessionId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const session = await matchSession_service_1.UserMatchSessionService.leaveSession(userId, sessionId);
            return res.status(200).json({ success: true, message: "Left match session", data: session });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error leaving match session" });
        }
    }
}
exports.UserMatchSessionController = UserMatchSessionController;
//# sourceMappingURL=matchSession.controller.js.map