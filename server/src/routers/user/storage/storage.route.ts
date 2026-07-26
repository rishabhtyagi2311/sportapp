import { Router } from "express";
import { UserStorageController } from "../../../controllers/user/storage/storage.controller";
import { authenticateUser } from "../../../middlewares/auth.middleware";

const router = Router();

router.post("/storage/presigned-url", authenticateUser, UserStorageController.getPresignedUrl);

export default router;
