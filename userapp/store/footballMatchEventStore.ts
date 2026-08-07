// store/footballMatchEventStore.ts — real, server-backed live match scoring store.
import { create } from 'zustand';
import { footballService } from '@/services/football';
import { MatchCreationData } from './footballMatchCreationStore';
import { FootballMatch } from '@/types/football';
import { queryClient } from '@/lib/queryClient';

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

/** Replays a match's substitution events on top of its starting roster
 *  snapshot to derive who's currently on the pitch — used when a creator
 *  resumes scoring a live match they didn't just start in this app session
 *  (e.g. tapping it from the Live Matches list after navigating away). */
function reconstructRosterState(match: FootballMatch): LiveRosterState {
  const home = match.homeRoster!;
  const away = match.awayRoster!;
  const state: LiveRosterState = {
    homeOnPitch: [...home.startingXI],
    homeBench: [...home.bench],
    awayOnPitch: [...away.startingXI],
    awayBench: [...away.bench],
    homeSubsUsed: 0,
    awaySubsUsed: 0,
  };

  const subEvents = (match.events ?? [])
    .filter((e) => e.eventType === 'substitution')
    .sort((a, b) => (a.minute === b.minute ? a.seconds - b.seconds : a.minute - b.minute));

  for (const event of subEvents) {
    const playerIn = event.playerId;
    const playerOut = event.relatedPlayerId;
    if (playerIn == null || playerOut == null) continue;

    if (event.teamId === match.homeTeamId) {
      state.homeOnPitch = [...state.homeOnPitch.filter((id) => id !== playerOut), playerIn];
      state.homeBench = [...state.homeBench.filter((id) => id !== playerIn), playerOut];
      state.homeSubsUsed += 1;
    } else {
      state.awayOnPitch = [...state.awayOnPitch.filter((id) => id !== playerOut), playerIn];
      state.awayBench = [...state.awayBench.filter((id) => id !== playerIn), playerOut];
      state.awaySubsUsed += 1;
    }
  }

  return state;
}

interface MatchExecutionState {
  activeMatch: FootballMatch | null;
  roster: LiveRosterState | null;
  isLoading: boolean;
  error: string | null;

  startMatch: (matchSetup: MatchCreationData) => Promise<FootballMatch>;
  scheduleMatch: (data: { homeTeamId: number; awayTeamId: number; scheduledAt: string; venueName?: string }) => Promise<FootballMatch>;
  /** Loads an already-created + already-started match directly into
   *  "active match" state — used by the tournament flow, which creates the
   *  match via a different endpoint (tied to a fixture) but then hands off
   *  to the exact same live-scoring UI as a friendly match. */
  loadActiveMatch: (match: FootballMatch, roster: LiveRosterState) => void;
  /** Loads a live match the creator is resuming from the Live Matches list
   *  (not one they just started this session) — fetches the full match with
   *  its event log and reconstructs current on-pitch state from it. */
  resumeAsCreator: (matchId: string) => Promise<void>;
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
  togglePossession: (teamId: number) => Promise<void>;
  pausePossessionSync: () => Promise<void>;
  resumePossessionSync: () => Promise<void>;
  endMatch: (data?: { penaltyHomeScore?: number; penaltyAwayScore?: number; notes?: string }) => Promise<FootballMatch>;
  abandonMatch: (reason?: string) => Promise<void>;
  clearActiveMatch: () => void;

  fetchMatchById: (id: string) => Promise<FootballMatch | null>;

  getTeamScore: (teamId: number) => number;
  getElapsedSeconds: () => number;
  setError: (error: string | null) => void;
}

export const useMatchExecutionStore = create<MatchExecutionState>((set, get) => ({
  activeMatch: null,
  roster: null,
  isLoading: false,
  error: null,

  startMatch: async (matchSetup) => {
    set({ isLoading: true, error: null });
    try {
      const homeRoster = {
        startingXI: matchSetup.myTeam.selectedPlayers,
        bench: matchSetup.myTeam.substitutes,
        captainId: matchSetup.myTeam.captain!,
        subsUsed: 0,
      };
      const awayRoster = {
        startingXI: matchSetup.opponentTeam.selectedPlayers,
        bench: matchSetup.opponentTeam.substitutes,
        captainId: matchSetup.opponentTeam.captain!,
        subsUsed: 0,
      };
      const referees = matchSetup.referees.map((r) => r.name);

      let started: FootballMatch;
      if (matchSetup.existingMatchId) {
        // Finalizing a match that was already created via `scheduleMatch` —
        // teams/venue are already set, this call supplies the deferred
        // lineup/settings and flips it to live in one step.
        started = await footballService.startMatch(matchSetup.existingMatchId, {
          playersPerTeam: matchSetup.playersPerTeam,
          allowedSubs: matchSetup.matchSettings?.maxSubstitutions ?? 0,
          extraTimeAllowed: matchSetup.matchSettings?.extraTimeAllowed ?? false,
          duration: matchSetup.matchSettings?.duration ?? 90,
          homeRoster,
          awayRoster,
          referees,
        });
      } else {
        const created = await footballService.createMatch({
          homeTeamId: matchSetup.myTeam.teamId,
          awayTeamId: matchSetup.opponentTeam.teamId,
          venueName: matchSetup.venue?.name,
          playersPerTeam: matchSetup.playersPerTeam,
          allowedSubs: matchSetup.matchSettings?.maxSubstitutions ?? 0,
          extraTimeAllowed: matchSetup.matchSettings?.extraTimeAllowed ?? false,
          duration: matchSetup.matchSettings?.duration ?? 90,
          homeRoster,
          awayRoster,
          referees,
        });

        started = await footballService.startMatch(created.id);
      }

      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['match', started.id] });

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

  scheduleMatch: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const match = await footballService.scheduleMatch(data);
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      set({ isLoading: false });
      return match;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not schedule match';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  loadActiveMatch: (match, roster) => set({ activeMatch: match, roster, error: null }),

  resumeAsCreator: async (matchId) => {
    set({ isLoading: true, error: null });
    const match = await footballService.fetchMatchById(matchId);
    if (!match) {
      set({ isLoading: false, error: 'Match not found' });
      throw new Error('Match not found');
    }
    set({ activeMatch: match, roster: reconstructRosterState(match), isLoading: false });
  },

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
    // A live match always has its settings finalized before it could go live.
    const limit = activeMatch.allowedSubs!;
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

  togglePossession: async (teamId) => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    set({ error: null });
    try {
      const updated = await footballService.updatePossession(activeMatch.id, teamId);
      set({ activeMatch: updated });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not update possession';
      set({ error: message });
      throw new Error(message);
    }
  },

  pausePossessionSync: async () => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    try {
      const updated = await footballService.pausePossession(activeMatch.id);
      set({ activeMatch: updated });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not pause possession tracking';
      set({ error: message });
      throw new Error(message);
    }
  },

  resumePossessionSync: async () => {
    const { activeMatch } = get();
    if (!activeMatch) return;

    try {
      const updated = await footballService.resumePossession(activeMatch.id);
      set({ activeMatch: updated });
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not resume possession tracking';
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
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['match', activeMatch.id] });
      set({ activeMatch: null, roster: null, isLoading: false });
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
      queryClient.invalidateQueries({ queryKey: ['myMatches'] });
      queryClient.invalidateQueries({ queryKey: ['match', activeMatch.id] });
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
