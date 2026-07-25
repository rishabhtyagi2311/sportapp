// @/services/booking/booking.ts
import apiClient from '@/utils/apiClient';
import { UserBooking } from '@/types/venue';

export const bookingApiService = {
  getMyBookings: async (): Promise<{ success: boolean; data: UserBooking[] }> => {
    const response = await apiClient.get('/user/bookings');
    return response.data;
  },

  createBooking: async (payload: {
    venueId: string;
    slotId: string;
    participants?: number;
  }): Promise<{ success: boolean; message: string; data: UserBooking }> => {
    const response = await apiClient.post('/user/bookings', payload);
    return response.data;
  },

  cancelBooking: async (bookingId: string): Promise<{ success: boolean; message: string; data: UserBooking }> => {
    const response = await apiClient.patch(`/user/bookings/${bookingId}/cancel`);
    return response.data;
  },
};
