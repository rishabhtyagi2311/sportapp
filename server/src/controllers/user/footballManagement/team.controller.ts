import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { FootballTeamService } from "../../../services/user/footballManagement/team";
import { footballTeamCreateSchema } from "../../../types/user/football";

export class FootballTeamController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = footballTeamCreateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid team data", error: parsed.error.issues });
      }

      const team = await FootballTeamService.createTeam(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Team created successfully", data: team });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating team" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const teams = await FootballTeamService.getMyTeams(userId);

      return res.status(200).json({ success: true, data: teams });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching your teams" });
    }
  }

  static async players(req: Request, res: Response) {
    try {
      const players = await FootballTeamService.getAllPlayers();

      return res.status(200).json({ success: true, players });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching players" });
    }
  }

  static async all(req: Request, res: Response) {
    try {
      const teams = await FootballTeamService.getAllTeams();

      return res.status(200).json({ success: true, data: teams });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching teams" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const teamId = parseInt(req.params.teamId, 10);
      if (isNaN(teamId)) {
        return res.status(400).json({ success: false, message: "Invalid team id" });
      }

      const team = await FootballTeamService.getTeamById(teamId);

      if (!team) {
        return res.status(404).json({ success: false, message: "Team not found" });
      }

      return res.status(200).json({ success: true, data: team });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching team" });
    }
  }

  static async addMember(req: UserAuthRequest, res: Response) {
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

      const team = await FootballTeamService.addMember(userId, teamId, playerId);

      return res.status(200).json({ success: true, message: "Member added", data: team });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error adding member" });
    }
  }
}
