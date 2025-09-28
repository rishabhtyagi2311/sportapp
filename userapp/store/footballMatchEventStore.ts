// stores/matchExecutionStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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
  isExtraTime: boolean;
  description?: string;
  timestamp: Date;
}

export type EventType = 'goal' | 'penalty' | 'card' | 'substitution' | 'offside' | 'foul' | 'corner' | 'free_kick';

export type EventSubType = 
  // Goal types
  | 'header' | 'left_foot' | 'right_foot' | 'penalty_goal' | 'free_kick_goal' | 'own_goal'
  // Card types  
  | 'yellow_card' | 'red_card' | 'second_yellow'
  // Foul types
  | 'dangerous_play' | 'unsporting_behavior' | 'dissent' | 'handball'
  // Other
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
  
  // Match setup data (from MatchCreationData)
  matchSetup: MatchCreationData;
  
  // Match execution data
  startTime: Date;
  endTime?: Date;
  actualDuration: number; // in minutes
  status: MatchStatus;
  
  // Score
  homeTeamScore: number;
  awayTeamScore: number;
  
  // Events
  events: MatchEvent[];
  
  // Statistics
  homeTeamStats: TeamStats;
  awayTeamStats: TeamStats;
  playerStats: PlayerStats[];
  
  // Match officials
  referees: string[];
  
  // Venue and conditions
  venue: string;
  weather?: string;
  attendance?: number;
  
  // Match notes
  notes?: string;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Active match state
export interface ActiveMatch {
  id: string;
  matchSetup: MatchCreationData;
  startTime: Date;
  currentMinute: number;
  status: MatchStatus;
  events: MatchEvent[];
  homeTeamScore: number;
  awayTeamScore: number;
  isExtraTime: boolean;
  notes: string;
}

// Store state
export interface MatchExecutionState {
  // Current active match
  activeMatch: ActiveMatch | null;
  
  // Completed matches history
  completedMatches: CompletedMatch[];
  
  // Loading states
  isStartingMatch: boolean;
  isSavingEvent: boolean;
  isEndingMatch: boolean;
  
  // Error handling
  error: string | null;
  
  // Actions for match lifecycle
  startMatch: (matchSetup: MatchCreationData) => void;
  endMatch: (notes?: string) => CompletedMatch | null;
  abandonMatch: (reason: string) => void;
  
  // Actions for events
  addEvent: (event: Omit<MatchEvent, 'id' | 'timestamp'>) => void;
  updateEvent: (eventId: string, updates: Partial<MatchEvent>) => void;
  removeEvent: (eventId: string) => void;
  
  // Actions for match state
  updateMatchStatus: (status: MatchStatus) => void;
  updateCurrentMinute: (minute: number) => void;
  addMatchNotes: (notes: string) => void;
  
  // Computed values
  getMatchDuration: () => number;
  getTeamScore: (teamId: string) => number;
  getTeamEvents: (teamId: string) => MatchEvent[];
  getPlayerEvents: (playerId: string) => MatchEvent[];
  getMatchStats: () => { homeStats: TeamStats; awayStats: TeamStats };
  
  // History management
  getCompletedMatches: () => CompletedMatch[];
  getMatchById: (matchId: string) => CompletedMatch | null;
  clearMatchHistory: () => void;
  
  // Error handling
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Helper functions
const calculateTeamStats = (events: MatchEvent[], teamId: string): TeamStats => {
  const teamEvents = events.filter(event => event.teamId === teamId);
  
  return {
    goals: teamEvents.filter(e => e.eventType === 'goal' && e.eventSubType !== 'own_goal').length,
    shots: 0, // Can be manually tracked or estimated
    shotsOnTarget: 0,
    possession: 0, // Would need to be manually entered
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
    
    // Find substitution events
    const substitutionOut = events.find(e => e.playerId === playerId && e.eventType === 'substitution');
    const substitutionIn = events.find(e => e.assistPlayerId === playerId && e.eventType === 'substitution');
    
    // Calculate minutes played
    let minutesPlayed = 0;
    const isStartingPlayer = matchSetup.myTeam.selectedPlayers.includes(playerId) || matchSetup.opponentTeam.selectedPlayers.includes(playerId);
    
    if (isStartingPlayer) {
      minutesPlayed = substitutionOut ? substitutionOut.minute : 90; // Assume 90 minutes if not substituted
    } else if (substitutionIn) {
      minutesPlayed = 90 - substitutionIn.minute; // Minutes from substitution to end
    }

    return {
      playerId,
      playerName: 'Player Name', // Would need to fetch from players store
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

// Initial state
const initialState = {
  activeMatch: null,
  completedMatches: [],
  isStartingMatch: false,
  isSavingEvent: false,
  isEndingMatch: false,
  error: null,
};

// Create the store
export const useMatchExecutionStore = create<MatchExecutionState>()(
  devtools(
    immer((set, get) => ({
      ...initialState,

      // Start a new match
      startMatch: (matchSetup) => set((state) => {
        const matchId = `match_${Date.now()}`;
        
        state.activeMatch = {
          id: matchId,
          matchSetup,
          startTime: new Date(),
          currentMinute: 0,
          status: 'in_progress',
          events: [],
          homeTeamScore: 0,
          awayTeamScore: 0,
          isExtraTime: false,
          notes: '',
        };
        
        state.error = null;
      }),

      // End the current match
      endMatch: (notes) => {
        const state = get();
        if (!state.activeMatch) return null;

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
          referees: state.activeMatch.matchSetup.referees.map(ref  => ref.name),
          venue: state.activeMatch.matchSetup.venue?.name || 'Unknown Venue',
          notes: notes || state.activeMatch.notes,
          createdAt: state.activeMatch.startTime,
          updatedAt: endTime,
        };

        set((state) => {
          state.completedMatches.unshift(completedMatch);
          state.activeMatch = null;
        });

        return completedMatch;
      },

      // Abandon match
      abandonMatch: (reason) => set((state) => {
        if (state.activeMatch) {
          state.activeMatch.status = 'abandoned';
          state.activeMatch.notes = `Match abandoned: ${reason}`;
        }
      }),

      // Add event to active match
      addEvent: (eventData) => set((state) => {
        if (!state.activeMatch) return;

        const newEvent: MatchEvent = {
          ...eventData,
          id: `event_${Date.now()}`,
          timestamp: new Date(),
        };

        state.activeMatch.events.push(newEvent);
        state.activeMatch.events.sort((a, b) => a.minute - b.minute);

        // Update scores if it's a goal
        if (newEvent.eventType === 'goal') {
          const isHomeTeam = newEvent.teamId === state.activeMatch.matchSetup.myTeam.teamId;
          const isOwnGoal = newEvent.eventSubType === 'own_goal';

          if (isOwnGoal) {
            // Own goal goes to opposite team
            if (isHomeTeam) {
              state.activeMatch.awayTeamScore += 1;
            } else {
              state.activeMatch.homeTeamScore += 1;
            }
          } else {
            // Regular goal
            if (isHomeTeam) {
              state.activeMatch.homeTeamScore += 1;
            } else {
              state.activeMatch.awayTeamScore += 1;
            }
          }
        }
      }),

      // Update event
      updateEvent: (eventId, updates) => set((state) => {
        if (!state.activeMatch) return;

        const eventIndex = state.activeMatch.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          Object.assign(state.activeMatch.events[eventIndex], updates);
          
          // Re-sort events
          state.activeMatch.events.sort((a, b) => a.minute - b.minute);
          
          // Recalculate scores
          const goals = state.activeMatch.events.filter(e => e.eventType === 'goal');
          let homeScore = 0;
          let awayScore = 0;

          goals.forEach(goal => {
            const isHomeTeam = goal.teamId === state.activeMatch!.matchSetup.myTeam.teamId;
            const isOwnGoal = goal.eventSubType === 'own_goal';

            if (isOwnGoal) {
              if (isHomeTeam) awayScore += 1;
              else homeScore += 1;
            } else {
              if (isHomeTeam) homeScore += 1;
              else awayScore += 1;
            }
          });

          state.activeMatch.homeTeamScore = homeScore;
          state.activeMatch.awayTeamScore = awayScore;
        }
      }),

      // Remove event
      removeEvent: (eventId) => set((state) => {
        if (!state.activeMatch) return;

        const eventIndex = state.activeMatch.events.findIndex(e => e.id === eventId);
        if (eventIndex !== -1) {
          const removedEvent = state.activeMatch.events[eventIndex];
          state.activeMatch.events.splice(eventIndex, 1);

          // Recalculate scores if it was a goal
          if (removedEvent.eventType === 'goal') {
            const isHomeTeam = removedEvent.teamId === state.activeMatch.matchSetup.myTeam.teamId;
            const isOwnGoal = removedEvent.eventSubType === 'own_goal';

            if (isOwnGoal) {
              if (isHomeTeam) {
                state.activeMatch.awayTeamScore = Math.max(0, state.activeMatch.awayTeamScore - 1);
              } else {
                state.activeMatch.homeTeamScore = Math.max(0, state.activeMatch.homeTeamScore - 1);
              }
            } else {
              if (isHomeTeam) {
                state.activeMatch.homeTeamScore = Math.max(0, state.activeMatch.homeTeamScore - 1);
              } else {
                state.activeMatch.awayTeamScore = Math.max(0, state.activeMatch.awayTeamScore - 1);
              }
            }
          }
        }
      }),

      // Update match status
      updateMatchStatus: (status) => set((state) => {
        if (state.activeMatch) {
          state.activeMatch.status = status;
        }
      }),

      // Update current minute
      updateCurrentMinute: (minute) => set((state) => {
        if (state.activeMatch) {
          state.activeMatch.currentMinute = minute;
        }
      }),

      // Add match notes
      addMatchNotes: (notes) => set((state) => {
        if (state.activeMatch) {
          state.activeMatch.notes = notes;
        }
      }),

      // Get match duration
      getMatchDuration: () => {
        const state = get();
        if (!state.activeMatch) return 0;
        
        const now = new Date();
        return Math.floor((now.getTime() - state.activeMatch.startTime.getTime()) / (1000 * 60));
      },

      // Get team score
      getTeamScore: (teamId) => {
        const state = get();
        if (!state.activeMatch) return 0;
        
        const isHomeTeam = teamId === state.activeMatch.matchSetup.myTeam.teamId;
        return isHomeTeam ? state.activeMatch.homeTeamScore : state.activeMatch.awayTeamScore;
      },

      // Get team events
      getTeamEvents: (teamId) => {
        const state = get();
        if (!state.activeMatch) return [];
        
        return state.activeMatch.events.filter(event => event.teamId === teamId);
      },

      // Get player events
      getPlayerEvents: (playerId) => {
        const state = get();
        if (!state.activeMatch) return [];
        
        return state.activeMatch.events.filter(event => 
          event.playerId === playerId || event.assistPlayerId === playerId
        );
      },

      // Get match statistics
      getMatchStats: () => {
        const state = get();
        if (!state.activeMatch) {
          return {
            homeStats: {} as TeamStats,
            awayStats: {} as TeamStats
          };
        }
        
        const homeStats = calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.myTeam.teamId);
        const awayStats = calculateTeamStats(state.activeMatch.events, state.activeMatch.matchSetup.opponentTeam.teamId);
        
        return { homeStats, awayStats };
      },

      // Get completed matches
      getCompletedMatches: () => {
        return get().completedMatches;
      },

      // Get match by ID
      getMatchById: (matchId) => {
        const state = get();
        return state.completedMatches.find(match => match.id === matchId) || null;
      },

      // Clear match history
      clearMatchHistory: () => set((state) => {
        state.completedMatches = [];
      }),

      // Error handling
      setError: (error) => set((state) => {
        state.error = error;
      }),

      clearError: () => set((state) => {
        state.error = null;
      }),
    })),
    {
      name: 'match-execution-store',
    }
  )
);