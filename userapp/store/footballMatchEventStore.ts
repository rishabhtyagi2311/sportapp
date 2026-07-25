// store/footballMatchEventStore.ts — real, server-backed live match scoring store.
import { create } from 'zustand';
import { footballService } from '@/services/football';
import { MatchCreationData } from './footballMatchCreationStore';
import { FootballMatch } from '@/types/football';

/** Tracks which players are currently on the pitch vs. benched during a live
 *  match. The server only keeps the starting roster snapshot + a chronological
 *  event log, not a "current pitch" pointer — this is recomputed fresh from
 *  that snapshot every time a match is started/loaded, and updated locally on
 *  each substitution so the picker UI knows who's available to bring on. */
export interface LiveRosterState {
  homeOnPitch: number[];
  homeBench: number[];
  awayOnPitch: number[];
  awayBench: number[];
  homeSubsUsed: number;
  awaySubsUsed: number;
}

interface MatchExecutionState {
  activeMatch: FootballMatch | null;
  roster: LiveRosterState | null;
  myMatches: FootballMatch[];
  isLoading: boolean;
  error: string | null;

  startMatch: (matchSetup: MatchCreationData) => Promise<FootballMatch>;
  /** Loads an already-created + already-started match directly into
   *  "active match" state — used by the tournament flow, which creates the
   *  match via a different endpoint (tied to a fixture) but then hands off
   *  to the exact same live-scoring UI as a friendly match. */
  loadActiveMatch: (match: FootballMatch, roster: LiveRosterState) => void;
  addEvent: (data: {
    teamId: number;
    playerId?: number;
    relatedPlayerId?: number;
    eventType: string;
    eventSubType?: string;
    minute: number;
    seconds: number;
    notes?: string;
  }) => Promise<void>;
  performSubstitution: (teamId: number, playerOutId: number, playerInId: number, minute: number, seconds: number) => Promise<void>;
  togglePossession: (teamId: number, currentSeconds: number) => Promise<void>;
  endMatch: (data?: { penaltyHomeScore?: number; penaltyAwayScore?: number; notes?: string }) => Promise<FootballMatch>;
  abandonMatch: (reason?: string) => Promise<void>;
  clearActiveMatch: () => void;

  fetchMatchById: (id: string) => Promise<FootballMatch | null>;
  fetchMyMatches: () => Promise<void>;

  getTeamScore: (teamId: number) => number;
  getElapsedSeconds: () => number;
  setError: (error: string | null) => void;
}

export const useMatchExecutionStore = create<MatchExecutionState>((set, get) => ({
  activeMatch: null,
  roster: null,
  myMatches: [],
  isLoading: false,
  error: null,

  startMatch: async (matchSetup) => {
    set({ isLoading: true, error: null });
    try {
      const created = await footballService.createMatch({
        homeTeamId: matchSetup.myTeam.teamId,
        awayTeamId: matchSetup.opponentTeam.teamId,
        venueName: matchSetup.venue?.name,
        playersPerTeam: matchSetup.playersPerTeam,
        allowedSubs: matchSetup.matchSettings?.maxSubstitutions ?? 0,
        extraTimeAllowed: matchSetup.matchSettings?.extraTimeAllowed ?? false,
        duration: matchSetup.matchSettings?.duration ?? 90,
        homeRoster: {
          startingXI: matchSetup.myTeam.selectedPlayers,
          bench: matchSetup.myTeam.substitutes,
          captainId: matchSetup.myTeam.captain!,
          subsUsed: 0,
        },
        awayRoster: {
          startingXI: matchSetup.opponentTeam.selectedPlayers,
          bench: matchSetup.opponentTeam.substitutes,
          captainId: matchSetup.opponentTeam.captain!,
          subsUsed: 0,
        },
        referees: matchSetup.referees.map((r) => r.name),
      });

      const started = await footballService.startMatch(created.id);

      set({
        activeMatch: started,
        roster: {
          homeOnPitch: [...matchSetup.myTeam.selectedPlayers],
          homeBench: [...matchSetup.myTeam.substitutes],
          awayOnPitch: [...matchSetup.opponentTeam.selectedPlayers],
          awayBench: [...matchSetup.opponentTeam.substitutes],
          homeSubsUsed: 0,
          awaySubsUsed: 0,
        },
        isLoading: false,
      });

      return started;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not start match';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  loadActiveMatch: (match, roster) => set({ activeMatch: match, roster, error: null }),

  addEvent: async (data) => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    set({ isLoading: true, error: null });
    try {
      await footballService.addMatchEvent(activeMatch.id, data);
      const refreshed = await footballService.fetchMatchById(activeMatch.id);
      set({ activeMatch: refreshed ?? activeMatch, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not record event';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  performSubstitution: async (teamId, playerOutId, playerInId, minute, seconds) => {
    const { activeMatch, roster } = get();
    if (!activeMatch || !roster) return;

    const isHome = teamId === activeMatch.homeTeamId;
    const limit = activeMatch.allowedSubs;
    const used = isHome ? roster.homeSubsUsed : roster.awaySubsUsed;

    if (used >= limit) {
      set({ error: 'Maximum substitutions reached.' });
      throw new Error('Maximum substitutions reached.');
    }

    await get().addEvent({
      teamId,
      playerId: playerInId,
      relatedPlayerId: playerOutId,
      eventType: 'substitution',
      minute,
      seconds,
    });

    set((state) => {
      if (!state.roster) return state;
      if (isHome) {
        return {
          roster: {
            ...state.roster,
            homeOnPitch: [...state.roster.homeOnPitch.filter((id) => id !== playerOutId), playerInId],
            homeBench: [...state.roster.homeBench.filter((id) => id !== playerInId), playerOutId],
            homeSubsUsed: state.roster.homeSubsUsed + 1,
          },
        };
      }
      return {
        roster: {
          ...state.roster,
          awayOnPitch: [...state.roster.awayOnPitch.filter((id) => id !== playerOutId), playerInId],
          awayBench: [...state.roster.awayBench.filter((id) => id !== playerInId), playerOutId],
          awaySubsUsed: state.roster.awaySubsUsed + 1,
        },
      };
    });
  },

  togglePossession: async (teamId, currentSeconds) => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    set({ error: null });
    try {
      const updated = await footballService.updatePossession(activeMatch.id, teamId, currentSeconds);
      set({ activeMatch: updated });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not update possession';
      set({ error: message });
      throw new Error(message);
    }
  },

  endMatch: async (data = {}) => {
    const { activeMatch } = get();
    if (!activeMatch) throw new Error('No active match');

    set({ isLoading: true, error: null });
    try {
      const completed = await footballService.endMatch(activeMatch.id, data);
      set((state) => ({
        activeMatch: null,
        roster: null,
        myMatches: [completed, ...state.myMatches],
        isLoading: false,
      }));
      return completed;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not end match';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  abandonMatch: async (reason) => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    set({ isLoading: true, error: null });
    try {
      await footballService.abandonMatch(activeMatch.id, reason);
      set({ activeMatch: null, roster: null, isLoading: false });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not abandon match';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  clearActiveMatch: () => set({ activeMatch: null, roster: null }),

  fetchMatchById: async (id) => {
    const match = await footballService.fetchMatchById(id);
    return match;
  },

  fetchMyMatches: async () => {
    set({ isLoading: true, error: null });
    const myMatches = await footballService.fetchMyMatches();
    set({ myMatches, isLoading: false });
  },

  getTeamScore: (teamId) => {
    const { activeMatch } = get();
    if (!activeMatch) return 0;
    return teamId === activeMatch.homeTeamId ? activeMatch.homeScore : activeMatch.awayScore;
  },

  getElapsedSeconds: () => {
    const { activeMatch } = get();
    if (!activeMatch?.startedAt) return 0;
    return Math.floor((Date.now() - new Date(activeMatch.startedAt).getTime()) / 1000);
  },

  setError: (error) => set({ error }),
}));
