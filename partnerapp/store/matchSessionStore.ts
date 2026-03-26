import { create } from 'zustand';

export interface MatchSession {
  id: string;
  venueId: string;
  venueName: string;
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
  createSession: (session: MatchSession) => void;
}

export const useMatchSessionStore = create<MatchSessionStore>((set) => ({
  sessions: [],
  createSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  })),
}));