import { Router } from "express";
import { AuthController } from "../../../controllers/partner/auth/auth.controller";
import { authenticatePartner } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/auth/register", AuthController.register);
router.post("/auth/login", AuthController.login);
router.get("/auth/me", authenticatePartner, AuthController.me);

export default router;
