"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FootballProfileController = void 0;
const profile_1 = require("../../../services/user/footballManagement/profile");
const football_1 = require("../../../types/user/football");
class FootballProfileController {
    static async register(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = football_1.footballProfileRegisterSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid profile data", error: parsed.error.issues });
            }
            const profile = await profile_1.FootballProfileService.register(userId, parsed.data);
            return res.status(201).json({ success: true, message: "Football profile created", data: profile });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating football profile" });
        }
    }
    static async check(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const result = await profile_1.FootballProfileService.checkForUser(userId);
            return res.status(200).json({ success: true, data: result });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error checking football profile" });
        }
    }
}
exports.FootballProfileController = FootballProfileController;
//# sourceMappingURL=profile.controller.js.map