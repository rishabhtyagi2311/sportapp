"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballTeamController = void 0;
const team_1 = require("../../../services/user/footballManagement/team");
const football_1 = require("../../../types/user/football");
class FootballTeamController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = football_1.footballTeamCreateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid team data", error: parsed.error.issues });
            }
            const team = await team_1.FootballTeamService.createTeam(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Team created successfully", data: team });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating team" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const teams = await team_1.FootballTeamService.getMyTeams(userId);
            return res.status(200).json({ success: true, data: teams });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error fetching your teams" });
        }
    }
    static async players(req, res) {
        try {
            const players = await team_1.FootballTeamService.getAllPlayers();
            return res.status(200).json({ success: true, players });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching players" });
        }
    }
    static async all(req, res) {
        try {
            const teams = await team_1.FootballTeamService.getAllTeams();
            return res.status(200).json({ success: true, data: teams });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching teams" });
        }
    }
    static async getById(req, res) {
        try {
            const teamId = parseInt(req.params.teamId, 10);
            if (isNaN(teamId)) {
                return res.status(400).json({ success: false, message: "Invalid team id" });
            }
            const team = await team_1.FootballTeamService.getTeamById(teamId);
            if (!team) {
                return res.status(404).json({ success: false, message: "Team not found" });
            }
            return res.status(200).json({ success: true, data: team });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching team" });
        }
    }
    static async addMember(req, res) {
        try {
            const userId = req.user?.id;
            const teamId = parseInt(req.params.teamId, 10);
            const { playerId } = req.body;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            if (isNaN(teamId) || typeof playerId !== "number") {
                return res.status(400).json({ success: false, message: "Invalid team id or player id" });
            }
            const team = await team_1.FootballTeamService.addMember(userId, teamId, playerId);
            return res.status(200).json({ success: true, message: "Member added", data: team });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error adding member" });
        }
    }
}
exports.FootballTeamController = FootballTeamController;
//# sourceMappingURL=team.controller.js.map