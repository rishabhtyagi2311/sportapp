import { Router } from "express";
import { LogController } from "../../../controllers/user/logManagement/log.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/logs/workout", authenticateUser, LogController.createWorkout);
router.get("/logs/workout/mine", authenticateUser, LogController.myWorkoutLogs);

router.post("/logs/nutrition", authenticateUser, LogController.createNutrition);
router.get("/logs/nutrition/mine", authenticateUser, LogController.myNutritionLogs);

router.post("/logs/health", authenticateUser, LogController.createHealth);
router.get("/logs/health/mine", authenticateUser, LogController.myHealthLogs);

export default router;
