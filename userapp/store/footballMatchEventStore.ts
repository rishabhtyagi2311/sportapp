import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { MatchCreationData } from './footballMatchCreationStore';

// Match event types
export interface MatchEvent {
  id: string;
  teamId: string;
  eventType: EventType;
  eventSubType?: EventSubType;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  minute: number;
  seconds: number;
  isExtraTime: boolean;
  timestamp: Date;
}

export type EventType = 'goal' | 'penalty' | 'card' | 'substitution' | 'offside' | 'foul' | 'corner' | 'free_kick';

export type EventSubType = 
  | 'header' | 'left_foot' | 'right_foot' | 'penalty_goal' | 'free_kick_goal' | 'own_goal'
  | 'yellow_card' | 'red_card' | 'second_yellow'
  | 'dangerous_play' | 'unsporting_behavior' | 'dissent' | 'handball'
  | 'injury_time' | 'time_wasting';

// Match status
export type MatchStatus = 'preparing' | 'in_progress' | 'half_time' | 'second_half' | 'extra_time' | 'finished' | 'abandoned';

// Match statistics
export interface TeamStats {
  goals: number;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  corners: number;
  fouls: number;
  yellowCards: number;
  redCards: number;
  offsides: number;
}

export interface PlayerStats {
  playerId: string;
  playerName: string;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  substitutedAt?: number;
  substitutedBy?: string;
}

// Complete match data
export interface CompletedMatch {
  id: string;
  matchSetup: MatchCreationData;
  startTime: Date;
  endTime?: Date;
  actualDuration: number;
  status: MatchStatus;
  homeTeamScore: number;
  awayTeamScore: number;
  events: MatchEvent[];
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  playerStats: PlayerStats[];
  referees: string[];
  venue: string;
  weather?: string;
  attendance?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Active match state
export interface ActiveMatch {
  id: string;
  context?: {
    type: 'friendly' | 'tournament';
    tournamentId?: string;
    fixtureId?: string;
    tableId?: string;
  };
  matchSetup: MatchCreationData;
  startTime: Date;
  timerStartedAt: Date;
  currentMinute: number;
  status: MatchStatus;
  events: MatchEvent[];
  homeTeamScore: number;
  awayTeamScore: number;
  isExtraTime: boolean;
  notes: string;

  // NEW: Roster State
  homeTeamOnPitch: string[];
  homeTeamBench: string[];
  awayTeamOnPitch: string[];
  awayTeamBench: string[];
  
  // NEW: Substitution Limits
  homeSubsUsed: number;
  awaySubsUsed: number;
}

export interface MatchExecutionState {
  activeMatch: ActiveMatch | null;
  liveMatches: ActiveMatch[];
  completedMatches: CompletedMatch[];
  isStartingMatch: boolean;
  isSavingEvent: boolean;
  isEndingMatch: boolean;
  error: string | null;

  // Actions
  startMatch: (matchSetup: MatchCreationData) => void;
  setMatchContext: (context: ActiveMatch['context']) => void;
  endMatch: (notes?: string) => CompletedMatch | null;
  abandonMatch: (reason: string) => void;
  addEvent: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => void;
  
  // NEW: Substitution Action
  performSubstitution: (teamId: string, playerOutId: string, playerInId: string, playerOutName: string, playerInName: string, minute: number, seconds: number) => void;
  
  updateEvent: (eventId: string, updates: Partial<MatchEvent>) => void;
  removeEvent: (eventId: string) => void;
  updateMatchStatus: (status: MatchStatus) => void;
  updateCurrentMinute: (minute: number) => void;
  addMatchNotes: (notes: string) => void;

  // Computed values
  getMatchDuration: () => number;
  getTeamScore: (teamId: string) => number;
  getTeamEvents: (teamId: string) => MatchEvent[];
  getPlayerEvents: (playerId: string) => MatchEvent[];
  getMatchStats: () => { homeStats: TeamStats; awayStats: TeamStats };
  getCompletedMatches: () => CompletedMatch[];
  getMatchById: (matchId: string) => CompletedMatch | null;
  clearMatchHistory: () => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Live match management
  addLiveMatch: (matchSetup: MatchCreationData) => string;
  updateLiveMatch: (matchId: string, updates: Partial<ActiveMatch>) => void;
  completeLiveMatch: (matchId: string, notes?: string) => CompletedMatch | null;
  getLiveMatches: () => ActiveMatch[];

  // Timer methods
  getCurrentMatchTime: () => { minutes: number, seconds: number };
  getElapsedSeconds: () => number;
  resetTimer: () => void;
}

// Helper functions
const calculateTeamStats = (events: MatchEvent[], teamId: string): TeamStats => {
  const teamEvents = events.filter(event => event.teamId === teamId);
  return {
    goals: teamEvents.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal').length,
    shots: 0,
    shotsOnTarget: 0,
    possession: 0,
    corners: teamEvents.filter(e => e.eventType === 'corner').length,
    fouls: teamEvents.filter(e => e.eventType === 'foul').length,
    yellowCards: teamEvents.filter(e => e.eventType === 'card' && e.eventSubType === 'yellow_card').length,
    redCards: teamEvents.filter(e => e.eventType === 'card' && (e.eventSubType === 'red_card' || e.eventSubType === 'second_yellow')).length,
    offsides: teamEvents.filter(e => e.eventType === 'offside').length,
  };
};

const calculatePlayerStats = (events: MatchEvent[], matchSetup: MatchCreationData): PlayerStats[] => {
  const allPlayers = [
    ...matchSetup.myTeam.selectedPlayers,
    ...matchSetup.opponentTeam.selectedPlayers,
    ...matchSetup.myTeam.substitutes,
    ...matchSetup.opponentTeam.substitutes
  ];
  return allPlayers.map(playerId => {
    const playerEvents = events.filter(e => e.playerId === playerId || e.assistPlayerId === playerId);
    
    const goals = playerEvents.filter(e => e.playerId === playerId && e.eventType === 'goal' && e.eventSubType !== 'own_goal').length;
    const assists = playerEvents.filter(e => e.assistPlayerId === playerId && e.eventType === 'goal').length;
    const yellowCards = playerEvents.filter(e => e.playerId === playerId && e.eventType === 'card' && e.eventSubType === 'yellow_card').length;
    const redCards = playerEvents.filter(e => e.playerId === playerId && e.eventType === 'card' && (e.eventSubType === 'red_card' || e.eventSubType === 'second_yellow')).length;
    
    const substitutionOut = events.find(e => e.playerId === playerId && e.eventType === 'substitution');
    const substitutionIn = events.find(e => e.assistPlayerId === playerId && e.eventType === 'substitution');
    
    let minutesPlayed = 0;
    // Check if player was in starting lineup
    const isStartingPlayer = matchSetup.myTeam.selectedPlayers.includes(playerId) || matchSetup.opponentTeam.selectedPlayers.includes(playerId);
    
    if (isStartingPlayer) {
      minutesPlayed = substitutionOut ? substitutionOut.minute : 90; 
    } else if (substitutionIn) {
      minutesPlayed = 90 - substitutionIn.minute; 
    }
    return {
      playerId,
      playerName: 'Player Name', 
      goals,
      assists,
      yellowCards,
      redCards,
      minutesPlayed,
      substitutedAt: substitutionOut?.minute,
      substitutedBy: substitutionOut?.assistPlayerId,
    };
  });
};

const initialState = {
  activeMatch: null,
  liveMatches: [],
  completedMatches: [],
  isStartingMatch: false,
  isSavingEvent: false,
  isEndingMatch: false,
  error: null,
};

export const useMatchExecutionStore = create<MatchExecutionState>()(
  devtools(
    persist(
      immer((set, get) => ({
        ...initialState,

        startMatch: (matchSetup) => set((state) => {
          const matchId = `match_${Date.now()}`;
          const now = new Date();
          
          const newMatch: ActiveMatch = {
            id: matchId,
            matchSetup,
            startTime: now,
            timerStartedAt: now,
            currentMinute: 0,
            status: 'preparing', 
            events: [],
            homeTeamScore: 0,
            awayTeamScore: 0,
            isExtraTime: false,
            notes: '',
            // Initialize Roster Logic
            homeTeamOnPitch: [...matchSetup.myTeam.selectedPlayers],
            homeTeamBench: [...matchSetup.myTeam.substitutes],
            awayTeamOnPitch: [...matchSetup.opponentTeam.selectedPlayers],
            awayTeamBench: [...matchSetup.opponentTeam.substitutes],
            homeSubsUsed: 0,
            awaySubsUsed: 0
          };
          
          state.activeMatch = newMatch;
          state.liveMatches.push(newMatch);
          state.error = null;
        }),

        setMatchContext: (context) => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.context = context;
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) {
              state.liveMatches[liveMatchIndex].context = context;
            }
          }
        }),

        performSubstitution: (teamId, playerOutId, playerInId, playerOutName, playerInName, minute, seconds) => set((state) => {
            if (!state.activeMatch) return;
            
            const isHome = teamId === state.activeMatch.matchSetup.myTeam.teamId;
            const limit = state.activeMatch.matchSetup.matchSettings?.maxSubstitutions ?? 5;
            const used = isHome ? state.activeMatch.homeSubsUsed : state.activeMatch.awaySubsUsed;
        
            if (used >= limit) {
                state.error = "Maximum substitutions reached.";
                return;
            }
        
            // Swap in state
            if (isHome) {
                state.activeMatch.homeTeamOnPitch = state.activeMatch.homeTeamOnPitch.filter(id => id !== playerOutId);
                state.activeMatch.homeTeamOnPitch.push(playerInId);
                state.activeMatch.homeTeamBench = state.activeMatch.homeTeamBench.filter(id => id !== playerInId);
                state.activeMatch.homeTeamBench.push(playerOutId); 
                state.activeMatch.homeSubsUsed++;
            } else {
                state.activeMatch.awayTeamOnPitch = state.activeMatch.awayTeamOnPitch.filter(id => id !== playerOutId);
                state.activeMatch.awayTeamOnPitch.push(playerInId);
                state.activeMatch.awayTeamBench = state.activeMatch.awayTeamBench.filter(id => id !== playerInId);
                state.activeMatch.awayTeamBench.push(playerOutId);
                state.activeMatch.awaySubsUsed++;
            }
        
            // Log Event
            const newEvent: MatchEvent = {
                id: `event_${Date.now()}`,
                teamId,
                eventType: 'substitution',
                playerId: playerOutId, // Player leaving
                playerName: playerOutName,
                assistPlayerId: playerInId, // Player entering
                assistPlayerName: playerInName,
                minute,
                seconds,
                isExtraTime: false,
                timestamp: new Date()
            };
            
            state.activeMatch.events.push(newEvent);
            state.activeMatch.events.sort((a, b) => a.minute - b.minute);

            // Sync with LiveMatches
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) {
                state.liveMatches[liveMatchIndex] = state.activeMatch; // Full sync recommended for roster changes
            }
        }),

        addLiveMatch: (matchSetup) => {
          // ... (same as previous, just ensure roster is initialized if used here)
          const matchId = `match_${Date.now()}`;
          // ...
          return matchId; 
        },

        updateLiveMatch: (matchId, updates) => set((state) => {
          const matchIndex = state.liveMatches.findIndex(m => m.id === matchId);
          if (matchIndex !== -1) {
            Object.assign(state.liveMatches[matchIndex], updates);
          }
        }),

        completeLiveMatch: (matchId, notes) => {
           const state = get();
           const matchIndex = state.liveMatches.findIndex(m => m.id === matchId);
           if (matchIndex === -1) return null;

           const match = state.liveMatches[matchIndex];
           const endTime = new Date();
           const actualDuration = Math.floor((endTime.getTime() - match.startTime.getTime()) / (1000 * 60));
           
           const homeTeamStats = calculateTeamStats(match.events, match.matchSetup.myTeam.teamId);
           const awayTeamStats = calculateTeamStats(match.events, match.matchSetup.opponentTeam.teamId);
           const playerStats = calculatePlayerStats(match.events, match.matchSetup);
           
           const completedMatch: CompletedMatch = {
             id: match.id,
             matchSetup: match.matchSetup,
             startTime: match.startTime,
             endTime,
             actualDuration,
             status: 'finished',
             homeTeamScore: match.homeTeamScore,
             awayTeamScore: match.awayTeamScore,
             events: match.events,
             homeTeamStats,
             awayTeamStats,
             playerStats,
             referees: match.matchSetup.referees.map(ref => ref.name),
             venue: match.matchSetup.venue?.name || 'Unknown Venue',
             notes: notes || match.notes,
             createdAt: match.startTime,
             updatedAt: endTime,
           };
           
           set((state) => {
             state.completedMatches.unshift(completedMatch);
             state.liveMatches.splice(matchIndex, 1);
           });
           return completedMatch;
        },

        endMatch: (notes) => {
          const state = get();
          if (!state.activeMatch) return null;
          
          const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
          
          const endTime = new Date();
          const actualDuration = Math.floor((endTime.getTime() - state.activeMatch.startTime.getTime()) / (1000 * 60));
          
          const homeTeamStats = calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.myTeam.teamId);
          const awayTeamStats = calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.opponentTeam.teamId);
          const playerStats = calculatePlayerStats(state.activeMatch.events, state.activeMatch.matchSetup);
          
          const completedMatch: CompletedMatch = {
            id: state.activeMatch.id,
            matchSetup: state.activeMatch.matchSetup,
            startTime: state.activeMatch.startTime,
            endTime,
            actualDuration,
            status: 'finished',
            homeTeamScore: state.activeMatch.homeTeamScore,
            awayTeamScore: state.activeMatch.awayTeamScore,
            events: state.activeMatch.events,
            homeTeamStats,
            awayTeamStats,
            playerStats,
            referees: state.activeMatch.matchSetup.referees.map(ref => ref.name),
            venue: state.activeMatch.matchSetup.venue?.name || 'Unknown Venue',
            notes: notes || state.activeMatch.notes,
            createdAt: state.activeMatch.startTime,
            updatedAt: endTime,
          };
          
          set((state) => {
            state.completedMatches.unshift(completedMatch);
            state.activeMatch = null;
            if (liveMatchIndex !== -1) {
              state.liveMatches.splice(liveMatchIndex, 1);
            }
          });
          
          return completedMatch;
        },

        abandonMatch: (reason) => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.status = 'abandoned';
            state.activeMatch.notes = `Match abandoned: ${reason}`;
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) {
              state.liveMatches[liveMatchIndex].status = 'abandoned';
              state.liveMatches[liveMatchIndex].notes = `Match abandoned: ${reason}`;
            }
          }
        }),

        addEvent: (eventData) => set((state) => {
          if (!state.activeMatch) return;
          const newEvent: MatchEvent = {
            ...eventData,
            id: `event_${Date.now()}`,
            timestamp: new Date(),
          };
          
          state.activeMatch.events.push(newEvent);
          state.activeMatch.events.sort((a, b) => a.minute - b.minute);
          
          if (newEvent.eventType === 'goal') {
            const isHomeTeam = newEvent.teamId === state.activeMatch.matchSetup.myTeam.teamId;
            const isOwnGoal = newEvent.eventSubType === 'own_goal';
            
            if (isOwnGoal) {
              if (isHomeTeam) state.activeMatch.awayTeamScore += 1;
              else state.activeMatch.homeTeamScore += 1;
            } else {
              if (isHomeTeam) state.activeMatch.homeTeamScore += 1;
              else state.activeMatch.awayTeamScore += 1;
            }
          }

          const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
          if (liveMatchIndex !== -1) {
            state.liveMatches[liveMatchIndex].events = state.activeMatch.events;
            state.liveMatches[liveMatchIndex].homeTeamScore = state.activeMatch.homeTeamScore;
            state.liveMatches[liveMatchIndex].awayTeamScore = state.activeMatch.awayTeamScore;
          }
        }),

        updateEvent: (eventId, updates) => set((state) => {
          if (!state.activeMatch) return;
          const eventIndex = state.activeMatch.events.findIndex(e => e.id === eventId);
          if (eventIndex !== -1) {
            Object.assign(state.activeMatch.events[eventIndex], updates);
            state.activeMatch.events.sort((a, b) => a.minute - b.minute);
            
            let homeScore = 0;
            let awayScore = 0;
            state.activeMatch.events.filter(e => e.eventType === 'goal').forEach(goal => {
               const isHome = goal.teamId === state.activeMatch!.matchSetup.myTeam.teamId;
               const isOwn = goal.eventSubType === 'own_goal';
               if(isOwn) { isHome ? awayScore++ : homeScore++; }
               else { isHome ? homeScore++ : awayScore++; }
            });
            state.activeMatch.homeTeamScore = homeScore;
            state.activeMatch.awayTeamScore = awayScore;

            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) {
               state.liveMatches[liveMatchIndex].events = state.activeMatch.events;
               state.liveMatches[liveMatchIndex].homeTeamScore = homeScore;
               state.liveMatches[liveMatchIndex].awayTeamScore = awayScore;
            }
          }
        }),

        removeEvent: (eventId) => set((state) => {
           if (!state.activeMatch) return;
           const index = state.activeMatch.events.findIndex(e => e.id === eventId);
           if (index !== -1) {
             const removed = state.activeMatch.events[index];
             state.activeMatch.events.splice(index, 1);
             
             if (removed.eventType === 'goal') {
                const isHome = removed.teamId === state.activeMatch.matchSetup.myTeam.teamId;
                const isOwn = removed.eventSubType === 'own_goal';
                if(isOwn) { 
                   if(isHome) state.activeMatch.awayTeamScore = Math.max(0, state.activeMatch.awayTeamScore - 1);
                   else state.activeMatch.homeTeamScore = Math.max(0, state.activeMatch.homeTeamScore - 1);
                } else {
                   if(isHome) state.activeMatch.homeTeamScore = Math.max(0, state.activeMatch.homeTeamScore - 1);
                   else state.activeMatch.awayTeamScore = Math.max(0, state.activeMatch.awayTeamScore - 1);
                }
             }

             const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
             if (liveMatchIndex !== -1) {
               state.liveMatches[liveMatchIndex].events = state.activeMatch.events;
               state.liveMatches[liveMatchIndex].homeTeamScore = state.activeMatch.homeTeamScore;
               state.liveMatches[liveMatchIndex].awayTeamScore = state.activeMatch.awayTeamScore;
             }
           }
        }),

        updateMatchStatus: (status) => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.status = status;
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) state.liveMatches[liveMatchIndex].status = status;
          }
        }),

        updateCurrentMinute: (minute) => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.currentMinute = minute;
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) state.liveMatches[liveMatchIndex].currentMinute = minute;
          }
        }),

        addMatchNotes: (notes) => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.notes = notes;
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) state.liveMatches[liveMatchIndex].notes = notes;
          }
        }),

        getCurrentMatchTime: () => {
          const state = get();
          if (!state.activeMatch) return { minutes: 0, seconds: 0 };
          const now = new Date();
          const elapsed = now.getTime() - state.activeMatch.timerStartedAt.getTime();
          const totalSeconds = Math.floor(elapsed / 1000);
          return { minutes: Math.floor(totalSeconds / 60), seconds: totalSeconds % 60 };
        },

        getElapsedSeconds: () => {
          const state = get();
          if (!state.activeMatch) return 0;
          return Math.floor((new Date().getTime() - state.activeMatch.timerStartedAt.getTime()) / 1000);
        },

        resetTimer: () => set((state) => {
          if (state.activeMatch) {
            state.activeMatch.timerStartedAt = new Date();
            const liveMatchIndex = state.liveMatches.findIndex(m => m.id === state.activeMatch?.id);
            if (liveMatchIndex !== -1) state.liveMatches[liveMatchIndex].timerStartedAt = state.activeMatch.timerStartedAt;
          }
        }),

        getMatchDuration: () => {
           const state = get();
           if (!state.activeMatch) return 0;
           return Math.floor((new Date().getTime() - state.activeMatch.startTime.getTime()) / (1000 * 60));
        },

        getTeamScore: (teamId) => {
           const state = get();
           if (!state.activeMatch) return 0;
           return teamId === state.activeMatch.matchSetup.myTeam.teamId 
             ? state.activeMatch.homeTeamScore 
             : state.activeMatch.awayTeamScore;
        },

        getTeamEvents: (teamId) => get().activeMatch?.events.filter(e => e.teamId === teamId) || [],
        getPlayerEvents: (playerId) => get().activeMatch?.events.filter(e => e.playerId === playerId || e.assistPlayerId === playerId) || [],
        
        getMatchStats: () => {
           const state = get();
           if (!state.activeMatch) return { homeStats: {} as TeamStats, awayStats: {} as TeamStats };
           return {
             homeStats: calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.myTeam.teamId),
             awayStats: calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.opponentTeam.teamId)
           };
        },

        getCompletedMatches: () => get().completedMatches,
        getLiveMatches: () => get().liveMatches,
        getMatchById: (id) => get().completedMatches.find(m => m.id === id) || null,
        clearMatchHistory: () => set(s => { s.completedMatches = []; }),
        setError: (err) => set(s => { s.error = err; }),
        clearError: () => set(s => { s.error = null; }),
      })),
      {
        name: 'match-execution-storage',
        partialize: (state) => ({
          activeMatch: state.activeMatch,
          liveMatches: state.liveMatches,
          completedMatches: state.completedMatches,
        }),
      }
    )
  )
);