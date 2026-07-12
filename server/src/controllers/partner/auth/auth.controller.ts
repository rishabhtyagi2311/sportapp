import { Request, Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { AuthService } from "../../../services/partner/auth/auth.service";
import { partnerLoginSchema, partnerRegisterSchema } from "../../../types/partner/auth";

export class AuthController {
  static async register(req: Request, res: Response) {
    const parsed = partnerRegisterSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid registration data" });
    }

    try {
      const result = await AuthService.register(parsed.data);
      return res.status(201).json({
        success: true,
        message: "Partner account created successfully",
        data: result,
      });
    } catch (error: any) {
      return res.status(400).json({
        success: false,
        message: error.message || "Could not create partner account",
      });
    }
  }

  static async login(req: Request, res: Response) {
    const parsed = partnerLoginSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({ success: false, message: "Invalid login data" });
    }

    try {
      const result = await AuthService.login(parsed.data);
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

  static async me(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const partner = await AuthService.getById(partnerId);

      return res.status(200).json({ success: true, data: partner });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || "Partner not found" });
    }
  }
}
