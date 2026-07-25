// @/services/venue/venue.ts
import apiClient from '@/utils/apiClient';
import { Venue } from '@/types/booking';
import { VenueSlot } from '@/types/venue';

export const venueApiService = {
  getVenues: async (filters?: { city?: string }): Promise<{ success: boolean; count: number; data: Venue[] }> => {
    const response = await apiClient.get('/user/venues', { params: filters });
    return response.data;
  },

  getVenueById: async (venueId: string): Promise<{ success: boolean; data: Venue }> => {
    const response = await apiClient.get(`/user/venues/${venueId}`);
    return response.data;
  },

  getSlots: async (venueId: string, date?: string): Promise<{ success: boolean; data: VenueSlot[] }> => {
    const response = await apiClient.get(`/user/venues/${venueId}/slots`, { params: date ? { date } : {} });
    return response.data;
  },
};
