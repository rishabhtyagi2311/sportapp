import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { TournamentService } from "../../../services/user/tournamentManagement/tournament";
import { createTournamentSchema, startFixtureMatchSchema, setFixtureScheduleSchema } from "../../../types/user/tournament";

export class TournamentController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createTournamentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid tournament data", error: parsed.error.issues });
      }

      const tournament = await TournamentService.createTournament(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Tournament created", data: tournament });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating tournament" });
    }
  }

  static async start(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const tournament = await TournamentService.startTournament(userId, id);

      return res.status(200).json({ success: true, message: "Tournament started", data: tournament });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error starting tournament" });
    }
  }

  static async startFixtureMatch(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id, fixtureId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = startFixtureMatchSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid fixture-start data", error: parsed.error.issues });
      }

      const match = await TournamentService.startFixtureMatch(userId, id, fixtureId, parsed.data);

      return res.status(201).json({ success: true, message: "Fixture match started", data: match });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error starting fixture match" });
    }
  }

  static async setFixtureSchedule(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id, fixtureId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = setFixtureScheduleSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid fixture schedule data", error: parsed.error.issues });
      }

      const tournament = await TournamentService.setFixtureSchedule(userId, id, fixtureId, parsed.data);

      return res.status(200).json({ success: true, message: "Fixture schedule updated", data: tournament });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error setting fixture schedule" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const tournament = await TournamentService.getTournamentById(id);

      if (!tournament) {
        return res.status(404).json({ success: false, message: "Tournament not found" });
      }

      return res.status(200).json({ success: true, data: tournament });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching tournament" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const tournaments = await TournamentService.getMyTournaments(userId);

      return res.status(200).json({ success: true, data: tournaments });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching your tournaments" });
    }
  }

  static async remove(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await TournamentService.deleteTournament(userId, id);

      return res.status(200).json({ success: true, message: "Tournament deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error deleting tournament" });
    }
  }
}
