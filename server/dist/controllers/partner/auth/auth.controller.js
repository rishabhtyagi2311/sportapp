"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../../../services/partner/auth/auth.service");
const auth_1 = require("../../../types/partner/auth");
class AuthController {
    static async register(req, res) {
        const parsed = auth_1.partnerRegisterSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Invalid registration data" });
        }
        try {
            const result = await auth_service_1.AuthService.register(parsed.data);
            return res.status(201).json({
                success: true,
                message: "Partner account created successfully",
                data: result,
            });
        }
        catch (error) {
            return res.status(400).json({
                success: false,
                message: error.message || "Could not create partner account",
            });
        }
    }
    static async login(req, res) {
        const parsed = auth_1.partnerLoginSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ success: false, message: "Invalid login data" });
        }
        try {
            const result = await auth_service_1.AuthService.login(parsed.data);
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
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const partner = await auth_service_1.AuthService.getById(partnerId);
            return res.status(200).json({ success: true, data: partner });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message || "Partner not found" });
        }
    }
}
exports.AuthController = AuthController;
//# sourceMappingURL=auth.controller.js.map