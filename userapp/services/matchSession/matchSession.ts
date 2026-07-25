// @/services/matchSession/matchSession.ts
import apiClient from '@/utils/apiClient';
import { MatchSession } from '@/store/matchSessionStore';

export const matchSessionApiService = {
  listAvailable: async (filters?: {
    venueId?: string;
    date?: string;
  }): Promise<{ success: boolean; data: MatchSession[] }> => {
    const response = await apiClient.get('/user/match-sessions', { params: filters });
    return response.data;
  },

  getMine: async (): Promise<{ success: boolean; data: MatchSession[] }> => {
    const response = await apiClient.get('/user/match-sessions/mine');
    return response.data;
  },

  getById: async (sessionId: string): Promise<{ success: boolean; data: MatchSession }> => {
    const response = await apiClient.get(`/user/match-sessions/${sessionId}`);
    return response.data;
  },

  join: async (sessionId: string): Promise<{ success: boolean; message: string; data: MatchSession }> => {
    const response = await apiClient.post(`/user/match-sessions/${sessionId}/join`);
    return response.data;
  },

  leave: async (sessionId: string): Promise<{ success: boolean; message: string; data: MatchSession }> => {
    const response = await apiClient.post(`/user/match-sessions/${sessionId}/leave`);
    return response.data;
  },
};
