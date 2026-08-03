import { create } from 'zustand';
import { academyApiService } from '@/services/academyManagement/academy';

export interface DemoBooking {
  id: string;
  childProfileId: string;
  academyId: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  childName?: string;
  fatherName?: string;
  fatherContact?: string;
}

interface DemoBookingStore {
  bookings: DemoBooking[];
  isLoading: boolean;
  error: string | null;
  fetchDemoBookings: (academyId: string, status?: string) => Promise<void>;
  confirmDemoBooking: (bookingId: string) => Promise<void>;
  completeDemoBooking: (bookingId: string) => Promise<void>;
  cancelDemoBooking: (bookingId: string) => Promise<void>;
  rescheduleDemoBooking: (bookingId: string, bookingDate: string) => Promise<void>;
}

export const useDemoBookingStore = create<DemoBookingStore>((set) => ({
  bookings: [],
  isLoading: false,
  error: null,

  fetchDemoBookings: async (academyId, status) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getDemoBookings(academyId, status);
      if (response.success) {
        set({ bookings: response.data, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load demo bookings', isLoading: false });
    }
  },

  confirmDemoBooking: async (bookingId) => {
    const response = await academyApiService.confirmDemoBooking(bookingId);
    if (!response.success) {
      throw new Error(response.message || 'Could not confirm demo booking');
    }
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
    }));
  },

  completeDemoBooking: async (bookingId) => {
    const response = await academyApiService.completeDemoBooking(bookingId);
    if (!response.success) {
      throw new Error(response.message || 'Could not complete demo booking');
    }
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
    }));
  },

  cancelDemoBooking: async (bookingId) => {
    const response = await academyApiService.cancelDemoBooking(bookingId);
    if (!response.success) {
      throw new Error(response.message || 'Could not cancel demo booking');
    }
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
    }));
  },

  rescheduleDemoBooking: async (bookingId, bookingDate) => {
    const response = await academyApiService.rescheduleDemoBooking(bookingId, bookingDate);
    if (!response.success) {
      throw new Error(response.message || 'Could not reschedule demo booking');
    }
    set((state) => ({
      bookings: state.bookings.map((b) => (b.id === bookingId ? response.data : b)),
    }));
  },
}));
