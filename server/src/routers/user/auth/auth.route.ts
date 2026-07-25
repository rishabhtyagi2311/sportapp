import { Router } from "express";
import { UserAuthController } from "../../../controllers/user/auth/auth.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/auth/register", UserAuthController.register);
router.post("/auth/login", UserAuthController.login);
router.get("/auth/me", authenticateUser, UserAuthController.me);
router.put("/auth/me", authenticateUser, UserAuthController.updateProfile);

export default router;
