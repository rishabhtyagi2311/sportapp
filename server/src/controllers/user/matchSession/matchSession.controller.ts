import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { UserMatchSessionService } from "../../../services/user/matchSession/matchSession.service";

export class UserMatchSessionController {
  static async list(req: Request, res: Response) {
    try {
      const { venueId, date } = req.query;

      const sessions = await UserMatchSessionService.listAvailable({
        venueId: venueId as string | undefined,
        date: date as string | undefined,
      });

      return res.status(200).json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching match sessions" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { sessionId } = req.params;
      const session = await UserMatchSessionService.getById(sessionId);

      return res.status(200).json({ success: true, data: session });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || "Match session not found" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const sessions = await UserMatchSessionService.getMySessions(userId);

      return res.status(200).json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching match sessions" });
    }
  }

  static async join(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const session = await UserMatchSessionService.joinSession(userId, sessionId);

      return res.status(200).json({ success: true, message: "Joined match session", data: session });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error joining match session" });
    }
  }

  static async leave(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { sessionId } = req.params;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const session = await UserMatchSessionService.leaveSession(userId, sessionId);

      return res.status(200).json({ success: true, message: "Left match session", data: session });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error leaving match session" });
    }
  }
}
