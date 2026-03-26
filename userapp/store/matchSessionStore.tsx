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
  hostName: string; // Added to show who is hosting
}

interface MatchSessionStore {
  sessions: MatchSession[];
  setSessions: (sessions: MatchSession[]) => void;
  createSession: (session: MatchSession) => void;
}

export const useMatchSessionStore = create<MatchSessionStore>((set) => ({
  sessions: [
    {
      id: 'm1',
      venueId: 'v1',
      venueName: 'The Arena Turf',
      slotId: 's1',
      date: '2026-03-28',
      startTime: '19:00',
      endTime: '20:00',
      sport: 'Football (5v5)',
      totalPlayers: 10,
      minPlayersForLive: 8,
      pricePerPerson: 250,
      skillLevel: 'Intermediate',
      description: 'Competitive 5v5 game. Bibs provided. Please bring turf shoes.',
      status: 'pending',
      playersJoined: 6,
      hostName: 'Suryawanshi Promoters'
    },
    {
      id: 'm2',
      venueId: 'v2',
      venueName: 'Skyline Box Cricket',
      slotId: 's2',
      date: '2026-03-29',
      startTime: '21:00',
      endTime: '22:30',
      sport: 'Box Cricket',
      totalPlayers: 16,
      minPlayersForLive: 12,
      pricePerPerson: 150,
      skillLevel: 'Open',
      description: 'Friendly weekend match. All equipment provided.',
      status: 'live',
      playersJoined: 14,
      hostName: 'Webaura Sports'
    }
  ],
  setSessions: (sessions) => set({ sessions }),
  createSession: (session) => set((state) => ({ 
    sessions: [...state.sessions, session] 
  })),
}));