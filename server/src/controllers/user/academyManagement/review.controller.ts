import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { ReviewService } from "../../../services/user/academyManagement/review";
import { createReviewSchema } from "../../../types/user/academy";

export class ReviewController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createReviewSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid review data", error: parsed.error.issues });
      }

      const review = await ReviewService.createReview(parentId, parsed.data);

      return res.status(201).json({ success: true, message: "Review submitted", data: review });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating review" });
    }
  }

  static async listForAcademy(req: Request, res: Response) {
    try {
      const { academyId } = req.params;
      const reviews = await ReviewService.getReviewsForAcademy(academyId);

      return res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching reviews" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const reviews = await ReviewService.getMyReviews(parentId);

      return res.status(200).json({ success: true, data: reviews });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching reviews" });
    }
  }
}
