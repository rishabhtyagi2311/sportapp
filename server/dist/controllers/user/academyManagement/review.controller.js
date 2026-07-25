"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const review_1 = require("../../../services/user/academyManagement/review");
const academy_1 = require("../../../types/user/academy");
class ReviewController {
    static async create(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = academy_1.createReviewSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid review data", error: parsed.error.issues });
            }
            const review = await review_1.ReviewService.createReview(parentId, parsed.data);
            return res.status(201).json({ success: true, message: "Review submitted", data: review });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating review" });
        }
    }
    static async listForAcademy(req, res) {
        try {
            const { academyId } = req.params;
            const reviews = await review_1.ReviewService.getReviewsForAcademy(academyId);
            return res.status(200).json({ success: true, data: reviews });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching reviews" });
        }
    }
    static async mine(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const reviews = await review_1.ReviewService.getMyReviews(parentId);
            return res.status(200).json({ success: true, data: reviews });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching reviews" });
        }
    }
}
exports.ReviewController = ReviewController;
//# sourceMappingURL=review.controller.js.map