// store/tournamentStore.ts — real, server-backed tournament store, unified across
// league and knockout formats (both are handled by the same backend engine).
import { create } from 'zustand';
import { footballService } from '@/services/football';
import { Tournament, TournamentEntry, TournamentFixture, MatchRoster, FootballMatch } from '@/types/football';

export interface TournamentDraft {
  format: 'league' | 'knockout';
  name: string;
  description: string;
  teamIds: number[];
  matchesPerPair: number;
  extraTimeAllowed: boolean;
  playersPerTeam: number;
  allowedSubs: number;
  venueName: string;
  duration: number; // regulation minutes per match — sent when each fixture's match is started
}

const initialDraft = (format: 'league' | 'knockout'): TournamentDraft => ({
  format,
  name: '',
  description: '',
  teamIds: [],
  matchesPerPair: 1,
  extraTimeAllowed: false,
  playersPerTeam: format === 'knockout' ? 11 : 7,
  allowedSubs: 3,
  venueName: '',
  duration: 90,
});

interface TournamentState {
  draft: TournamentDraft | null;
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  isLoading: boolean;
  error: string | null;

  startDraft: (format: 'league' | 'knockout') => void;
  updateDraft: (patch: Partial<TournamentDraft>) => void;
  addTeamToDraft: (teamId: number) => void;
  removeTeamFromDraft: (teamId: number) => void;
  cancelDraft: () => void;

  createTournament: () => Promise<Tournament>;
  startTournament: (id: string) => Promise<void>;
  startFixtureMatch: (
    tournamentId: string,
    fixtureId: string,
    data: { duration: number; homeRoster: MatchRoster; awayRoster: MatchRoster; referees: string[] }
  ) => Promise<FootballMatch>;
  deleteTournament: (id: string) => Promise<void>;
  setFixtureSchedule: (tournamentId: string, fixtureId: string, data: { scheduledAt: string; venueName?: string }) => Promise<void>;

  fetchMyTournaments: () => Promise<void>;
  fetchTournamentById: (id: string) => Promise<Tournament | null>;

  getTournament: (id: string) => Tournament | undefined;
  getFixturesByRound: (tournamentId: string, round: number) => TournamentFixture[];
  getStandings: (tournamentId: string) => TournamentEntry[];
  getTournamentProgress: (tournamentId: string) => { completed: number; total: number };
}

function upsertTournament(list: Tournament[], tournament: Tournament): Tournament[] {
  const index = list.findIndex((t) => t.id === tournament.id);
  if (index === -1) return [...list, tournament];
  const next = [...list];
  next[index] = tournament;
  return next;
}

export const useTournamentStore = create<TournamentState>((set, get) => ({
  draft: null,
  tournaments: [],
  activeTournament: null,
  isLoading: false,
  error: null,

  startDraft: (format) => set({ draft: initialDraft(format) }),

  updateDraft: (patch) => set((state) => (state.draft ? { draft: { ...state.draft, ...patch } } : state)),

  addTeamToDraft: (teamId) =>
    set((state) => {
      if (!state.draft || state.draft.teamIds.includes(teamId)) return state;
      return { draft: { ...state.draft, teamIds: [...state.draft.teamIds, teamId] } };
    }),

  removeTeamFromDraft: (teamId) =>
    set((state) =>
      state.draft ? { draft: { ...state.draft, teamIds: state.draft.teamIds.filter((id) => id !== teamId) } } : state
    ),

  cancelDraft: () => set({ draft: null, error: null }),

  createTournament: async () => {
    const { draft } = get();
    if (!draft) throw new Error('No tournament draft in progress');

    set({ isLoading: true, error: null });
    try {
      const tournament = await footballService.createTournament({
        name: draft.name,
        description: draft.description || undefined,
        format: draft.format,
        teamIds: draft.teamIds,
        matchesPerPair: draft.format === 'league' ? draft.matchesPerPair : undefined,
        extraTimeAllowed: draft.extraTimeAllowed,
        playersPerTeam: draft.playersPerTeam,
        allowedSubs: draft.allowedSubs,
        venueName: draft.venueName || undefined,
      });
      set((state) => ({
        tournaments: upsertTournament(state.tournaments, tournament),
        draft: null,
        isLoading: false,
      }));
      return tournament;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not create tournament';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  startTournament: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const tournament = await footballService.startTournament(id);
      set((state) => ({
        tournaments: upsertTournament(state.tournaments, tournament),
        activeTournament: tournament,
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not start tournament';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  startFixtureMatch: async (tournamentId, fixtureId, data) => {
    set({ isLoading: true, error: null });
    try {
      const match = await footballService.startFixtureMatch(tournamentId, fixtureId, data);
      set({ isLoading: false });
      return match;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not start fixture match';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  setFixtureSchedule: async (tournamentId, fixtureId, data) => {
    set({ isLoading: true, error: null });
    try {
      const tournament = await footballService.setFixtureSchedule(tournamentId, fixtureId, data);
      set((state) => ({
        tournaments: upsertTournament(state.tournaments, tournament),
        activeTournament: state.activeTournament?.id === tournamentId ? tournament : state.activeTournament,
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not set fixture schedule';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteTournament: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await footballService.deleteTournament(id);
      set((state) => ({
        tournaments: state.tournaments.filter((t) => t.id !== id),
        activeTournament: state.activeTournament?.id === id ? null : state.activeTournament,
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not delete tournament';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchMyTournaments: async () => {
    set({ isLoading: true, error: null });
    const tournaments = await footballService.fetchMyTournaments();
    set({ tournaments, isLoading: false });
  },

  fetchTournamentById: async (id) => {
    const tournament = await footballService.fetchTournamentById(id);
    if (tournament) {
      set((state) => ({
        tournaments: upsertTournament(state.tournaments, tournament),
        activeTournament: tournament,
      }));
    }
    return tournament;
  },

  getTournament: (id) => get().tournaments.find((t) => t.id === id) ?? (get().activeTournament?.id === id ? get().activeTournament! : undefined),

  getFixturesByRound: (tournamentId, round) => {
    const tournament = get().getTournament(tournamentId);
    return tournament ? tournament.fixtures.filter((f) => f.round === round) : [];
  },

  getStandings: (tournamentId) => {
    const tournament = get().getTournament(tournamentId);
    if (!tournament) return [];
    return [...tournament.entries].sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      const gdA = a.goalsFor - a.goalsAgainst;
      const gdB = b.goalsFor - b.goalsAgainst;
      if (gdB !== gdA) return gdB - gdA;
      return b.goalsFor - a.goalsFor;
    });
  },

  getTournamentProgress: (tournamentId) => {
    const tournament = get().getTournament(tournamentId);
    if (!tournament) return { completed: 0, total: 0 };
    return {
      completed: tournament.fixtures.filter((f) => f.status === 'completed').length,
      total: tournament.fixtures.length,
    };
  },
}));
