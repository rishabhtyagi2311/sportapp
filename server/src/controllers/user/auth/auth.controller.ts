import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { UserAuthService } from "../../../services/user/auth/auth.service";
import { userLoginSchema, userRegisterSchema, updateUserProfileSchema } from "../../../types/user/auth";

export class UserAuthController {
  static async register(req: Request, res: Response) {
    const parsed = userRegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid registration data" });
    }

    try {
      const result = await UserAuthService.register(parsed.data);
      return res.status(201).json({
        success: true,
        message: "Account created successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Could not create account",
      });
    }
  }

  static async login(req: Request, res: Response) {
    const parsed = userLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid login data" });
    }

    try {
      const result = await UserAuthService.login(parsed.data);
      return res.status(200).json({
        success: true,
        message: "Login successful",
        data: result,
      });
    } catch (error: any) {
      return res.status(401).json({
        success: false,
        message: error.message || "Invalid credentials",
      });
    }
  }

  static async me(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const user = await UserAuthService.getById(userId);

      return res.status(200).json({ success: true, data: user });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || "User not found" });
    }
  }

  static async updateProfile(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = updateUserProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid profile data", error: parsed.error.issues });
      }

      const user = await UserAuthService.updateProfile(userId, parsed.data);

      return res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error updating profile" });
    }
  }
}
