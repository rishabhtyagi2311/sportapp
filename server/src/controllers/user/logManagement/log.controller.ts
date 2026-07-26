import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { WorkoutLogService, NutritionLogService, HealthLogService } from "../../../services/user/logManagement/log";
import { createWorkoutLogSchema, createNutritionLogSchema, createHealthLogSchema } from "../../../types/user/log";

export class LogController {
  static async createWorkout(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createWorkoutLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid workout log data", error: parsed.error.issues });
      }

      const log = await WorkoutLogService.create(userId, parsed.data);
      return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating workout log" });
    }
  }

  static async myWorkoutLogs(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const logs = await WorkoutLogService.getMine(userId);
      return res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching workout logs" });
    }
  }

  static async createNutrition(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createNutritionLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid nutrition log data", error: parsed.error.issues });
      }

      const log = await NutritionLogService.create(userId, parsed.data);
      return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating nutrition log" });
    }
  }

  static async myNutritionLogs(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const logs = await NutritionLogService.getMine(userId);
      return res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching nutrition logs" });
    }
  }

  static async createHealth(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createHealthLogSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid health log data", error: parsed.error.issues });
      }

      const log = await HealthLogService.create(userId, parsed.data);
      return res.status(201).json({ success: true, data: log });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating health log" });
    }
  }

  static async myHealthLogs(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const logs = await HealthLogService.getMine(userId);
      return res.status(200).json({ success: true, data: logs });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching health logs" });
    }
  }
}
