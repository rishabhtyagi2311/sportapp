import { prisma as globalClient } from "../../../index";

function mapReviewForClient(review: any) {
  const { childProfile, ...rest } = review;
  return {
    ...rest,
    createdAt: review.createdAt?.toISOString?.() ?? review.createdAt,
    ...(childProfile ? { childName: childProfile.childName } : {}),
  };
}

export class ReviewService {
  static async createReview(
    parentId: number,
    data: { academyId: string; childProfileId: string; rating: number; title?: string; comment: string }
  ) {
    const childProfile = await globalClient.childProfile.findFirst({
      where: { id: data.childProfileId, parentId },
    });

    if (!childProfile) {
      throw new Error("Child profile not found");
    }

    const enrollment = await globalClient.student.findFirst({
      where: { childProfileId: data.childProfileId, academyId: data.academyId, status: "active" },
    });

    if (!enrollment) {
      throw new Error("You can only review an academy your child has an approved enrollment at");
    }

    const review = await globalClient.$transaction(async (tx) => {
      const created = await tx.review.create({
        data: {
          academyId: data.academyId,
          childProfileId: data.childProfileId,
          parentId,
          rating: data.rating,
          title: data.title,
          comment: data.comment,
        },
        include: { childProfile: true },
      });

      const aggregate = await tx.review.aggregate({
        where: { academyId: data.academyId },
        _avg: { rating: true },
        _count: { rating: true },
      });

      await tx.academy.update({
        where: { id: data.academyId },
        data: {
          averageRating: aggregate._avg.rating || 0,
          reviewCount: aggregate._count.rating,
        },
      });

      return created;
    });

    return mapReviewForClient(review);
  }

  static async getReviewsForAcademy(academyId: string) {
    const reviews = await globalClient.review.findMany({
      where: { academyId },
      include: { childProfile: true },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map(mapReviewForClient);
  }

  static async getMyReviews(parentId: number) {
    const reviews = await globalClient.review.findMany({
      where: { parentId },
      include: { childProfile: true },
      orderBy: { createdAt: "desc" },
    });

    return reviews.map(mapReviewForClient);
  }
}
