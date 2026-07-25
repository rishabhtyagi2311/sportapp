"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthController = void 0;
const auth_service_1 = require("../../../services/user/auth/auth.service");
const auth_1 = require("../../../types/user/auth");
class UserAuthController {
    static async register(req, res) {
        const parsed = auth_1.userRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Invalid registration data" });
        }
        try {
            const result = await auth_service_1.UserAuthService.register(parsed.data);
            return res.status(201).json({
                success: true,
                message: "Account created successfully",
                data: result,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create account",
            });
        }
    }
    static async login(req, res) {
        const parsed = auth_1.userLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Invalid login data" });
        }
        try {
            const result = await auth_service_1.UserAuthService.login(parsed.data);
            return res.status(200).json({
                success: true,
                message: "Login successful",
                data: result,
            });
        }
        catch (error) {
            return res.status(401).json({
                success: false,
                message: error.message || "Invalid credentials",
            });
        }
    }
    static async me(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const user = await auth_service_1.UserAuthService.getById(userId);
            return res.status(200).json({ success: true, data: user });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message || "User not found" });
        }
    }
    static async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = auth_1.updateUserProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid profile data", error: parsed.error.issues });
            }
            const user = await auth_service_1.UserAuthService.updateProfile(userId, parsed.data);
            return res.status(200).json({ success: true, message: "Profile updated successfully", data: user });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error updating profile" });
        }
    }
}
exports.UserAuthController = UserAuthController;
//# sourceMappingURL=auth.controller.js.map