// @/api/venueService.ts
import axios from 'axios';
import apiClient from '@/utils/apiClient';
import { CreateVenueInput } from '@/types/venue';

export const venueApiService = {
  // 1. Get Pre-signed URL
  getPresignedUrl: async (fileName: string, fileType: string) => {
    const response = await apiClient.post('/storage/presigned-url', { fileName, fileType });
    return response.data; 
  },

  // 2. Upload to S3
  uploadToS3: async (uploadUrl: string, blob: Blob, fileType: string) => {
    return await axios.put(uploadUrl, blob, {
      headers: { 'Content-Type': fileType },
    });
  },

  // 3. Create Venue (New)
  createVenue: async (venueData: CreateVenueInput) => {
    const response = await apiClient.post('/venues', venueData);
    return response.data;
  },

  // 4. Fetch Partner's Venues (New)
  getMyVenues: async () => {
    const response = await apiClient.get('/venues/my-venues');
    return response.data; // Expected { success: true, data: Venue[] }
  },

  // 5. Fetch Slots by Venue and Date (New)
  getSlots: async (venueId: string, date: string) => {
    const response = await apiClient.get('/slots', {
      params: { venueId, date }
    });
    return response.data; // Expected { success: true, data: TimeSlot[] }
  }
};