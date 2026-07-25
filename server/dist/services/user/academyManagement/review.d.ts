export declare class ReviewService {
    static createReview(parentId: number, data: {
        academyId: string;
        childProfileId: string;
        rating: number;
        title?: string;
        comment: string;
    }): Promise<any>;
    static getReviewsForAcademy(academyId: string): Promise<any[]>;
    static getMyReviews(parentId: number): Promise<any[]>;
}
//# sourceMappingURL=review.d.ts.map