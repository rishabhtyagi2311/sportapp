import { create } from 'zustand';
import { DemoBooking } from '@/types/academy';
import { academyApiService } from '@/services/academyManagement/academy';

interface DemoBookingStore {
  demoBookings: DemoBooking[];
  isLoading: boolean;
  error: string | null;

  fetchMyDemoBookings: () => Promise<void>;
  createDemoBooking: (payload: { childProfileId: string; academyId: string; bookingDate: string }) => Promise<DemoBooking>;
  cancelDemoBooking: (id: string) => Promise<void>;
  isDemoBooked: (childProfileId: string, academyId: string) => boolean;
}

export const useDemoBookingStore = create<DemoBookingStore>((set, get) => ({
  demoBookings: [],
  isLoading: false,
  error: null,

  fetchMyDemoBookings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getMyDemoBookings();
      set({ demoBookings: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load demo bookings', isLoading: false });
    }
  },

  createDemoBooking: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.createDemoBooking(payload);
      set((state) => ({ demoBookings: [response.data, ...state.demoBookings], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not book a demo';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  cancelDemoBooking: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.cancelDemoBooking(id);
      set((state) => ({
        demoBookings: state.demoBookings.map((b) => (b.id === id ? response.data : b)),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not cancel demo booking';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  isDemoBooked: (childProfileId, academyId) =>
    get().demoBookings.some(
      (b) => b.childProfileId === childProfileId && b.academyId === academyId && b.status !== 'cancelled'
    ),
}));
