"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentController = void 0;
const tournament_1 = require("../../../services/user/tournamentManagement/tournament");
const tournament_2 = require("../../../types/user/tournament");
class TournamentController {
    static async create(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = tournament_2.createTournamentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid tournament data", error: parsed.error.issues });
            }
            const tournament = await tournament_1.TournamentService.createTournament(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Tournament created", data: tournament });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating tournament" });
        }
    }
    static async start(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const tournament = await tournament_1.TournamentService.startTournament(userId, id);
            return res.status(200).json({ success: true, message: "Tournament started", data: tournament });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error starting tournament" });
        }
    }
    static async startFixtureMatch(req, res) {
        try {
            const userId = req.user?.id;
            const { id, fixtureId } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = tournament_2.startFixtureMatchSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid fixture-start data", error: parsed.error.issues });
            }
            const match = await tournament_1.TournamentService.startFixtureMatch(userId, id, fixtureId, parsed.data);
            return res.status(201).json({ success: true, message: "Fixture match started", data: match });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error starting fixture match" });
        }
    }
    static async getById(req, res) {
        try {
            const { id } = req.params;
            const tournament = await tournament_1.TournamentService.getTournamentById(id);
            if (!tournament) {
                return res.status(404).json({ success: false, message: "Tournament not found" });
            }
            return res.status(200).json({ success: true, data: tournament });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching tournament" });
        }
    }
    static async mine(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const tournaments = await tournament_1.TournamentService.getMyTournaments(userId);
            return res.status(200).json({ success: true, data: tournaments });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching your tournaments" });
        }
    }
    static async remove(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await tournament_1.TournamentService.deleteTournament(userId, id);
            return res.status(200).json({ success: true, message: "Tournament deleted" });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error deleting tournament" });
        }
    }
}
exports.TournamentController = TournamentController;
//# sourceMappingURL=tournament.controller.js.map