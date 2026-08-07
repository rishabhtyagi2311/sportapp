import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { MatchService } from "../../../services/user/matchManagement/match";
import { createMatchSchema, scheduleMatchSchema, startMatchSchema, addMatchEventSchema, updatePossessionSchema, endMatchSchema } from "../../../types/user/match";

export class MatchController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid match data", error: parsed.error.issues });
      }

      const match = await MatchService.createMatch(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Match created", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating match" });
    }
  }

  static async schedule(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = scheduleMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid schedule data", error: parsed.error.issues });
      }

      const match = await MatchService.scheduleMatch(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Match scheduled", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error scheduling match" });
    }
  }

  static async start(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = startMatchSchema.safeParse(req.body ?? {});
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid match start data", error: parsed.error.issues });
      }

      const match = await MatchService.startMatch(userId, id, parsed.data);

      return res.status(200).json({ success: true, message: "Match started", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error starting match" });
    }
  }

  static async abandon(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const match = await MatchService.abandonMatch(userId, id, req.body?.reason);

      return res.status(200).json({ success: true, message: "Match abandoned", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error abandoning match" });
    }
  }

  static async addEvent(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = addMatchEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
      }

      const event = await MatchService.addEvent(userId, id, parsed.data);

      return res.status(201).json({ success: true, message: "Event recorded", data: event });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error recording event" });
    }
  }

  static async updatePossession(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = updatePossessionSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid possession data", error: parsed.error.issues });
      }

      const match = await MatchService.updatePossession(userId, id, parsed.data);

      return res.status(200).json({ success: true, data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error updating possession" });
    }
  }

  static async pausePossession(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const match = await MatchService.pausePossession(userId, id);

      return res.status(200).json({ success: true, data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error pausing possession" });
    }
  }

  static async resumePossession(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const match = await MatchService.resumePossession(userId, id);

      return res.status(200).json({ success: true, data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error resuming possession" });
    }
  }

  static async end(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = endMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid match-end data", error: parsed.error.issues });
      }

      const match = await MatchService.endMatch(userId, id, parsed.data);

      return res.status(200).json({ success: true, message: "Match completed", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error ending match" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const match = await MatchService.getMatchById(id);

      if (!match) {
        return res.status(404).json({ success: false, message: "Match not found" });
      }

      return res.status(200).json({ success: true, data: match });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching match" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const matches = await MatchService.getMyMatches(userId);

      return res.status(200).json({ success: true, data: matches });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching your matches" });
    }
  }

  static async teamMatches(req: Request, res: Response) {
    try {
      const teamId = parseInt(req.params.teamId, 10);
      if (isNaN(teamId)) {
        return res.status(400).json({ success: false, message: "Invalid team id" });
      }

      const matches = await MatchService.getTeamMatches(teamId);

      return res.status(200).json({ success: true, data: matches });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching team matches" });
    }
  }

  static async playerStats(req: Request, res: Response) {
    try {
      const profileId = parseInt(req.params.profileId, 10);
      if (isNaN(profileId)) {
        return res.status(400).json({ success: false, message: "Invalid player id" });
      }

      const stats = await MatchService.getPlayerStats(profileId);

      return res.status(200).json({ success: true, data: stats });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching player stats" });
    }
  }
}
