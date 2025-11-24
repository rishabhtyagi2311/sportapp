// store/academyReviewStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface AcademyReview {
  id: string;
  academyId: string;
  academyName: string;
  childId: string;
  childName: string;
  reviewerName: string; // father's name
  rating: number; // 1-5
  title?: string;
  comment: string;
  createdAt: string;
}

interface ReviewsStore {
  reviews: AcademyReview[];
  addReview: (review: Omit<AcademyReview, "id" | "createdAt">) => void;
  updateReview: (id: string, updates: Partial<AcademyReview>) => void;
  deleteReview: (id: string) => void;
  getReviewsByAcademy: (academyId: string) => AcademyReview[];
  getReviewsByChild: (childId: string) => AcademyReview[];
  getAverageRatingForAcademy: (academyId: string) => number;
}

export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [],

      addReview: (reviewInput) =>
        set((state) => {
          const newReview: AcademyReview = {
            ...reviewInput,
            id: `${reviewInput.academyId}-${reviewInput.childId}-${Date.now()}`,
            createdAt: new Date().toISOString(),
          };
          return {
            reviews: [newReview, ...state.reviews],
          };
        }),

      updateReview: (id, updates) =>
        set((state) => ({
          reviews: state.reviews.map((review) =>
            review.id === id ? { ...review, ...updates } : review
          ),
        })),

      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id),
        })),

      getReviewsByAcademy: (academyId) => {
        const { reviews } = get();
        return reviews.filter((r) => r.academyId === academyId);
      },

      getReviewsByChild: (childId) => {
        const { reviews } = get();
        return reviews.filter((r) => r.childId === childId);
      },

      getAverageRatingForAcademy: (academyId) => {
        const { reviews } = get();
        const academyReviews = reviews.filter(
          (r) => r.academyId === academyId && typeof r.rating === "number"
        );
        if (academyReviews.length === 0) return 0;
        const total = academyReviews.reduce((sum, r) => sum + r.rating, 0);
        return total / academyReviews.length;
      },
    }),
    {
      name: "academy-reviews-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
