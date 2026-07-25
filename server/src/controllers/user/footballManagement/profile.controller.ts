import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { FootballProfileService } from "../../../services/user/footballManagement/profile";
import { footballProfileRegisterSchema } from "../../../types/user/football";

export class FootballProfileController {
  static async register(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = footballProfileRegisterSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid profile data", error: parsed.error.issues });
      }

      const profile = await FootballProfileService.register(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Football profile created", data: profile });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating football profile" });
    }
  }

  static async check(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const result = await FootballProfileService.checkForUser(userId);

      return res.status(200).json({ success: true, data: result });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error checking football profile" });
    }
  }
}
