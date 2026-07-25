// store/academyReviewStore.ts
import { create } from "zustand";
import { Review } from "@/types/academy";
import { academyApiService } from "@/services/academyManagement/academy";

interface ReviewsStore {
  reviews: Review[];
  myReviews: Review[];
  isLoading: boolean;
  error: string | null;

  fetchReviewsForAcademy: (academyId: string) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  submitReview: (payload: {
    academyId: string;
    childProfileId: string;
    rating: number;
    title?: string;
    comment: string;
  }) => Promise<Review>;
  getReviewsByAcademy: (academyId: string) => Review[];
}

export const useReviewsStore = create<ReviewsStore>((set, get) => ({
  reviews: [],
  myReviews: [],
  isLoading: false,
  error: null,

  fetchReviewsForAcademy: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getReviewsForAcademy(academyId);
      set((state) => ({
        reviews: [...state.reviews.filter((r) => r.academyId !== academyId), ...response.data],
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Could not load reviews", isLoading: false });
    }
  },

  fetchMyReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getMyReviews();
      set({ myReviews: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || "Could not load your reviews", isLoading: false });
    }
  },

  submitReview: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.createReview(payload);
      set((state) => ({ reviews: [response.data, ...state.reviews], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Could not submit review";
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getReviewsByAcademy: (academyId) => get().reviews.filter((r) => r.academyId === academyId),
}));
