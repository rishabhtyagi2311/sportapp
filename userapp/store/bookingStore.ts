import { create } from 'zustand';
import { bookingApiService } from '@/services/booking/booking';
import { UserBooking } from '@/types/venue';

interface UserBookingState {
  bookings: UserBooking[];
  isLoading: boolean;
  error: string | null;

  fetchMyBookings: () => Promise<void>;
  createBooking: (payload: { venueId: string; slotId: string; participants?: number }) => Promise<UserBooking>;
  cancelBooking: (bookingId: string) => Promise<void>;
}

export const useUserBookingStore = create<UserBookingState>((set, get) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchMyBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingApiService.getMyBookings();
      set({ bookings: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not load bookings';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  createBooking: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingApiService.createBooking(payload);
      set((state) => ({ bookings: [response.data, ...state.bookings], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'This slot could not be booked';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  cancelBooking: async (bookingId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await bookingApiService.cancelBooking(bookingId);
      set((state) => ({
        bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not cancel booking';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
