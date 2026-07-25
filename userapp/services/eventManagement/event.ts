// @/services/eventManagement/event.ts
import apiClient from '@/utils/apiClient';
import { EventItem, EventRegistration } from '@/types/event';

export const eventApiService = {
  getEvents: async (filters?: {
    sportName?: string;
    city?: string;
    eventType?: string;
    status?: string;
  }): Promise<{ success: boolean; count: number; data: EventItem[] }> => {
    const response = await apiClient.get('/user/events', { params: filters });
    return response.data;
  },

  getEventById: async (id: string): Promise<{ success: boolean; data: EventItem }> => {
    const response = await apiClient.get(`/user/events/${id}`);
    return response.data;
  },

  getMyEvents: async (): Promise<{ success: boolean; data: EventItem[] }> => {
    const response = await apiClient.get('/user/events/mine');
    return response.data;
  },

  createEvent: async (input: Record<string, any>): Promise<{ success: boolean; message: string; data: EventItem }> => {
    const response = await apiClient.post('/user/events', input);
    return response.data;
  },

  updateEvent: async (
    id: string,
    input: Record<string, any>
  ): Promise<{ success: boolean; message: string; data: EventItem }> => {
    const response = await apiClient.put(`/user/events/${id}`, input);
    return response.data;
  },

  deleteEvent: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/user/events/${id}`);
    return response.data;
  },

  createRegistration: async (
    eventId: string,
    input: { participationType: 'individual' | 'team'; footballTeamId?: number }
  ): Promise<{ success: boolean; message: string; data: EventRegistration }> => {
    const response = await apiClient.post(`/user/events/${eventId}/registrations`, input);
    return response.data;
  },

  getRegistrationsForEvent: async (eventId: string): Promise<{ success: boolean; data: EventRegistration[] }> => {
    const response = await apiClient.get(`/user/events/${eventId}/registrations`);
    return response.data;
  },

  processRegistration: async (
    eventId: string,
    registrationId: string,
    input: { status: 'accepted' | 'rejected'; notes?: string }
  ): Promise<{ success: boolean; message: string; data: EventRegistration }> => {
    const response = await apiClient.patch(`/user/events/${eventId}/registrations/${registrationId}`, input);
    return response.data;
  },

  getMyRegistrations: async (): Promise<{ success: boolean; data: EventRegistration[] }> => {
    const response = await apiClient.get('/user/registrations/mine');
    return response.data;
  },
};
