"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchController = void 0;
const match_1 = require("../../../services/user/matchManagement/match");
const match_2 = require("../../../types/user/match");
class MatchController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = match_2.createMatchSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid match data", error: parsed.error.issues });
            }
            const match = await match_1.MatchService.createMatch(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Match created", data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating match" });
        }
    }
    static async start(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const match = await match_1.MatchService.startMatch(userId, id);
            return res.status(200).json({ success: true, message: "Match started", data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error starting match" });
        }
    }
    static async abandon(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const match = await match_1.MatchService.abandonMatch(userId, id, req.body?.reason);
            return res.status(200).json({ success: true, message: "Match abandoned", data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error abandoning match" });
        }
    }
    static async addEvent(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = match_2.addMatchEventSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
            }
            const event = await match_1.MatchService.addEvent(userId, id, parsed.data);
            return res.status(201).json({ success: true, message: "Event recorded", data: event });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error recording event" });
        }
    }
    static async updatePossession(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = match_2.updatePossessionSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid possession data", error: parsed.error.issues });
            }
            const match = await match_1.MatchService.updatePossession(userId, id, parsed.data);
            return res.status(200).json({ success: true, data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error updating possession" });
        }
    }
    static async end(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = match_2.endMatchSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid match-end data", error: parsed.error.issues });
            }
            const match = await match_1.MatchService.endMatch(userId, id, parsed.data);
            return res.status(200).json({ success: true, message: "Match completed", data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error ending match" });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const match = await match_1.MatchService.getMatchById(id);
            if (!match) {
                return res.status(404).json({ success: false, message: "Match not found" });
            }
            return res.status(200).json({ success: true, data: match });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching match" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const matches = await match_1.MatchService.getMyMatches(userId);
            return res.status(200).json({ success: true, data: matches });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching your matches" });
        }
    }
    static async teamMatches(req, res) {
        try {
            const teamId = parseInt(req.params.teamId, 10);
            if (isNaN(teamId)) {
                return res.status(400).json({ success: false, message: "Invalid team id" });
            }
            const matches = await match_1.MatchService.getTeamMatches(teamId);
            return res.status(200).json({ success: true, data: matches });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching team matches" });
        }
    }
    static async playerStats(req, res) {
        try {
            const profileId = parseInt(req.params.profileId, 10);
            if (isNaN(profileId)) {
                return res.status(400).json({ success: false, message: "Invalid player id" });
            }
            const stats = await match_1.MatchService.getPlayerStats(profileId);
            return res.status(200).json({ success: true, data: stats });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching player stats" });
        }
    }
}
exports.MatchController = MatchController;
//# sourceMappingURL=match.controller.js.map