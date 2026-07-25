import { create } from 'zustand';
import { venueApiService } from '@/services/venue/venue';
import { VenueSlot } from '@/types/venue';

interface VenueSlotsState {
  slotsByKey: Record<string, VenueSlot[]>;
  isLoading: boolean;
  error: string | null;

  fetchSlotsForVenue: (venueId: string, date: string) => Promise<VenueSlot[]>;
  getSlots: (venueId: string, date: string) => VenueSlot[];
}

const keyFor = (venueId: string, date: string) => `${venueId}:${date}`;

export const useVenueSlotsStore = create<VenueSlotsState>((set, get) => ({
  slotsByKey: {},
  isLoading: false,
  error: null,

  fetchSlotsForVenue: async (venueId, date) => {
    set({ isLoading: true, error: null });
    try {
      const response = await venueApiService.getSlots(venueId, date);
      set((state) => ({
        slotsByKey: { ...state.slotsByKey, [keyFor(venueId, date)]: response.data },
        isLoading: false,
      }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not load slots';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getSlots: (venueId, date) => get().slotsByKey[keyFor(venueId, date)] || [],
}));
