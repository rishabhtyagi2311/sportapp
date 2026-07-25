import { Router } from "express";
import { UserMatchSessionController } from "../../../controllers/user/matchSession/matchSession.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.get("/match-sessions", UserMatchSessionController.list);
router.get("/match-sessions/mine", authenticateUser, UserMatchSessionController.mine);
router.get("/match-sessions/:sessionId", UserMatchSessionController.getById);
router.post("/match-sessions/:sessionId/join", authenticateUser, UserMatchSessionController.join);
router.post("/match-sessions/:sessionId/leave", authenticateUser, UserMatchSessionController.leave);

export default router;
