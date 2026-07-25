import { create } from 'zustand';
import { matchSessionApiService } from '@/services/matchSession/matchSession';

export interface MatchSession {
  id: string;
  venueId: string;
  venueName?: string;
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

interface MatchSessionStore {
  sessions: MatchSession[];
  myJoinedSessions: MatchSession[];
  isLoading: boolean;
  error: string | null;

  fetchAvailableSessions: (filters?: { venueId?: string; date?: string }) => Promise<void>;
  fetchMySessions: () => Promise<void>;
  fetchSessionById: (sessionId: string) => Promise<void>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: (sessionId: string) => Promise<void>;
  isSessionJoined: (sessionId: string) => boolean;
}

export const useMatchSessionStore = create<MatchSessionStore>((set, get) => ({
  sessions: [],
  myJoinedSessions: [],
  isLoading: false,
  error: null,

  fetchAvailableSessions: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchSessionApiService.listAvailable(filters);
      set({ sessions: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not load match sessions';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchMySessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchSessionApiService.getMine();
      set({ myJoinedSessions: response.data, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not load your match sessions';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchSessionById: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchSessionApiService.getById(sessionId);
      set((state) => {
        const exists = state.sessions.some((s) => s.id === sessionId);
        return {
          sessions: exists
            ? state.sessions.map((s) => (s.id === sessionId ? response.data : s))
            : [...state.sessions, response.data],
          isLoading: false,
        };
      });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not load this match session';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  isSessionJoined: (sessionId) => {
    return get().myJoinedSessions.some((s) => s.id === sessionId);
  },

  joinSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchSessionApiService.join(sessionId);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? response.data : s)),
        myJoinedSessions: state.myJoinedSessions.some((s) => s.id === sessionId)
          ? state.myJoinedSessions.map((s) => (s.id === sessionId ? response.data : s))
          : [...state.myJoinedSessions, response.data],
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not join this match session';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  leaveSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await matchSessionApiService.leave(sessionId);
      set((state) => ({
        sessions: state.sessions.map((s) => (s.id === sessionId ? response.data : s)),
        myJoinedSessions: state.myJoinedSessions.filter((s) => s.id !== sessionId),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not leave this match session';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },
}));
