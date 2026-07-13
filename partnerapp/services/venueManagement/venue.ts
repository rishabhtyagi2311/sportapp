// @/services/venueManagement/venue.ts
import * as FileSystem from 'expo-file-system/legacy';
import apiClient from '@/utils/apiClient';
import { CreateVenueInput } from '@/types/venue';

export const venueApiService = {
  // --- Storage (S3 upload) ---
  getPresignedUrl: async (fileName: string, fileType: string, venueName: string) => {
    const response = await apiClient.post('/partner/storage/presigned-url', { fileName, fileType, venueName });
    return response.data;
  },

  // Uploads the local file directly via native code (not a JS Blob — React
  // Native's Blob/fetch polyfill silently produces empty/corrupted bodies
  // when piped through axios for binary PUT uploads).
  uploadToS3: async (uploadUrl: string, fileUri: string, fileType: string) => {
    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': fileType },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`S3 upload failed with status ${result.status}`);
    }
    return result;
  },

  // --- Venue CRUD ---
  createVenue: async (venueData: CreateVenueInput) => {
    const response = await apiClient.post('/partner/venues', venueData);
    return response.data;
  },

  getMyVenues: async () => {
    const response = await apiClient.get('/partner/venues');
    return response.data;
  },

  getVenueById: async (venueId: string) => {
    const response = await apiClient.get(`/partner/venues/${venueId}`);
    return response.data;
  },

  updateVenue: async (venueId: string, updates: Partial<CreateVenueInput>) => {
    const response = await apiClient.put(`/partner/venues/${venueId}`, updates);
    return response.data;
  },

  deleteVenue: async (venueId: string) => {
    const response = await apiClient.delete(`/partner/venues/${venueId}`);
    return response.data;
  },

  // --- Slots ---
  getSlots: async (venueId: string, date: string) => {
    const response = await apiClient.get(`/partner/venues/${venueId}/slots`, {
      params: { date },
    });
    return response.data;
  },

  generateSlots: async (venueId: string, payload?: { daysCount?: number; basePrice?: number; startDate?: string }) => {
    const response = await apiClient.post(`/partner/venues/${venueId}/slots/generate`, payload || {});
    return response.data;
  },

  updateSlot: async (slotId: string, updates: { status?: string; price?: number; reason?: string }) => {
    const response = await apiClient.patch(`/partner/slots/${slotId}`, updates);
    return response.data;
  },

  // --- Manual blocks ---
  createBlock: async (payload: { venueId: string; slotId: string; reason: string; date?: string }) => {
    const response = await apiClient.post('/partner/slots/blocks', payload);
    return response.data;
  },

  removeBlock: async (blockId: string) => {
    const response = await apiClient.delete(`/partner/slots/blocks/${blockId}`);
    return response.data;
  },

  // --- Bookings ---
  getBookings: async (venueId: string, params?: { date?: string; status?: string }) => {
    const response = await apiClient.get(`/partner/venues/${venueId}/bookings`, { params });
    return response.data;
  },

  cancelBooking: async (venueId: string, bookingId: string) => {
    const response = await apiClient.patch(`/partner/venues/${venueId}/bookings/${bookingId}/cancel`);
    return response.data;
  },

  // --- Match sessions ---
  createMatchSession: async (payload: {
    venueId: string;
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    sport: string;
    totalPlayers: number;
    minPlayersForLive: number;
    pricePerPerson: number;
    skillLevel: string;
    description?: string;
  }) => {
    const response = await apiClient.post('/partner/match-sessions', payload);
    return response.data;
  },

  getMatchSessions: async (venueId: string, params?: { date?: string; status?: string }) => {
    const response = await apiClient.get(`/partner/venues/${venueId}/match-sessions`, { params });
    return response.data;
  },

  cancelMatchSession: async (venueId: string, sessionId: string) => {
    const response = await apiClient.patch(`/partner/venues/${venueId}/match-sessions/${sessionId}/cancel`);
    return response.data;
  },

  updateMatchSessionStatus: async (venueId: string, sessionId: string, status: 'live' | 'completed') => {
    const response = await apiClient.patch(`/partner/venues/${venueId}/match-sessions/${sessionId}/status`, { status });
    return response.data;
  },
};
