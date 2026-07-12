import { create } from 'zustand';
import { venueApiService } from '@/services/venueManagement/venue';

export interface MatchSession {
  id: string;
  venueId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  totalPlayers: number;
  minPlayersForLive: number;
  pricePerPerson: number;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced' | 'Open';
  description: string;
  status: 'pending' | 'live' | 'completed' | 'cancelled';
  playersJoined: number;
}

export interface CreateMatchSessionInput {
  venueId: string;
  slotId: string;
  date: string;
  startTime: string;
  endTime: string;
  sport: string;
  totalPlayers: number;
  minPlayersForLive: number;
  pricePerPerson: number;
  skillLevel: MatchSession['skillLevel'];
  description?: string;
}

interface MatchSessionStore {
  sessions: MatchSession[];
  isLoading: boolean;
  error: string | null;
  fetchSessions: (venueId: string) => Promise<void>;
  createSession: (session: CreateMatchSessionInput) => Promise<MatchSession>;
  cancelSession: (venueId: string, sessionId: string) => Promise<void>;
  setSessionStatus: (venueId: string, sessionId: string, status: 'live' | 'completed') => Promise<void>;
}

export const useMatchSessionStore = create<MatchSessionStore>((set, get) => ({
  sessions: [],
  isLoading: false,
  error: null,

  fetchSessions: async (venueId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await venueApiService.getMatchSessions(venueId);
      if (response.success) {
        set({ sessions: response.data, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load match sessions', isLoading: false });
    }
  },

  createSession: async (session) => {
    const response = await venueApiService.createMatchSession(session);
    if (!response.success) {
      throw new Error(response.message || 'Could not create match session');
    }
    const created: MatchSession = response.data;
    set((state) => ({ sessions: [...state.sessions, created] }));
    return created;
  },

  cancelSession: async (venueId, sessionId) => {
    const response = await venueApiService.cancelMatchSession(venueId, sessionId);
    if (!response.success) {
      throw new Error(response.message || 'Could not cancel match session');
    }
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, status: 'cancelled' } : s)),
    }));
  },

  setSessionStatus: async (venueId, sessionId, status) => {
    const response = await venueApiService.updateMatchSessionStatus(venueId, sessionId, status);
    if (!response.success) {
      throw new Error(response.message || 'Could not update match session status');
    }
    set((state) => ({
      sessions: state.sessions.map((s) => (s.id === sessionId ? { ...s, status } : s)),
    }));
  },
}));
