import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Review {
  id: string;
  academyId: string;
  userId: string; // This could be used to identify the reviewer
  userName: string;
  rating: number;
  comment: string;
  date: string; // ISO string format
  verified: boolean;
}

interface ReviewsStore {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'date' | 'verified'>) => void;
  updateReview: (id: string, updatedReview: Partial<Omit<Review, 'id' | 'date'>>) => void;
  deleteReview: (id: string) => void;
  getReviewsByAcademy: (academyId: string) => Review[];
  getUserReviewForAcademy: (userId: string, academyId: string) => Review | undefined;
  getAverageRatingForAcademy: (academyId: string) => number;
}

export const useReviewsStore = create<ReviewsStore>()(
  persist(
    (set, get) => ({
      reviews: [],
      
      addReview: (review) => 
        set((state) => ({
          reviews: [
            ...state.reviews,
            {
              ...review,
              id: `review-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              date: new Date().toISOString(),
              verified: true, // Assuming all user-submitted reviews are verified
            }
          ]
        })),
        
      updateReview: (id, updatedReview) =>
        set((state) => ({
          reviews: state.reviews.map((review) => 
            review.id === id ? { ...review, ...updatedReview } : review
          )
        })),
        
      deleteReview: (id) =>
        set((state) => ({
          reviews: state.reviews.filter((review) => review.id !== id)
        })),
        
      getReviewsByAcademy: (academyId) => {
        const { reviews } = get();
        return reviews
          .filter((review) => review.academyId === academyId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },
      
      getUserReviewForAcademy: (userId, academyId) => {
        const { reviews } = get();
        return reviews.find(
          (review) => review.userId === userId && review.academyId === academyId
        );
      },
      
      getAverageRatingForAcademy: (academyId) => {
        const { reviews } = get();
        const academyReviews = reviews.filter((review) => review.academyId === academyId);
        if (academyReviews.length === 0) return 0;
        
        const totalRating = academyReviews.reduce((sum, review) => sum + review.rating, 0);
        return totalRating / academyReviews.length;
      },
    }),
    {
      name: 'academy-reviews-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);