// stores/matchCreationStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Types for match creation
export interface MatchTeam {
  teamId: string;
  teamName: string;
  selectedPlayers: string[]; // Player IDs
  captain?: string; // Player ID
  viceCaptain?: string; // Player ID
  substitutes: string[]; // Player IDs for substitutes
}

export interface MatchVenue {
  id?: string;
  name: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  isCustom: boolean; 
}

export interface MatchReferee {
  name: string;
  index: number;
}

export interface MatchSettings {
  startTime: string; // ISO string or time format
  duration: number; // in minutes
  extraTimeAllowed: boolean;
  extraTimeDuration?: number; // in minutes, if extraTimeAllowed is true
  substitutionAllowed: boolean;
  maxSubstitutions?: number; // if substitutionAllowed is true
}

export interface MatchCreationData {
  // Team Selection (from first screen)
  myTeam: MatchTeam;
  opponentTeam: MatchTeam;
  
  // Match Details (from second screen)
  venue: MatchVenue | null;
  playersPerTeam: number;
  referees: MatchReferee[];
  
  // Player Selection (from subsequent screens)
  isMyTeamPlayersSelected: boolean;
  isOpponentPlayersSelected: boolean;
  
  // Captain Selection
  areCaptainsSelected: boolean;
  
  // Match Settings (final screen)
  matchSettings: MatchSettings | null;
  areSubstitutesSelected: boolean;
  
  // Match timing and other details (kept for backward compatibility)
  matchDate?: string;
  matchTime?: string;
  duration?: number;
  
  // Match status
  currentStep: 'team-selection' | 'match-details' | 'my-players' | 'opponent-players' | 'captains' | 'final-details' | 'ready';
}

export interface MatchCreationState {
  matchData: MatchCreationData;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeMatch: (myTeamId: string, myTeamName: string, opponentTeamId: string, opponentTeamName: string) => void;
  updateMatchDetails: (venue: MatchVenue, playersPerTeam: number, referees: MatchReferee[]) => void;
  updateMyTeamPlayers: (playerIds: string[]) => void;
  updateOpponentTeamPlayers: (playerIds: string[]) => void;
  updateCaptains: (myTeamCaptain: string, opponentTeamCaptain: string, myTeamViceCaptain?: string, opponentTeamViceCaptain?: string) => void;
  updateMatchSettings: (settings: MatchSettings) => void;
  updateSubstitutes: (myTeamSubstitutes: string[], opponentTeamSubstitutes: string[]) => void;
  setCurrentStep: (step: MatchCreationData['currentStep']) => void;
  clearMatchData: () => void;
  getMatchSummary: () => MatchCreationData;
  
  // Helper methods for substitutes
  getAvailableSubstitutes: (teamId: string, allPlayers: any[]) => any[];
  
  // Validation helpers
  canProceedToNextStep: () => boolean;
  getCurrentStepData: () => any;
  
  // Error handling
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

// Initial state
const initialMatchData: MatchCreationData = {
  myTeam: {
    teamId: '',
    teamName: '',
    selectedPlayers: [],
    substitutes: [],
  },
  opponentTeam: {
    teamId: '',
    teamName: '',
    selectedPlayers: [],
    substitutes: [],
  },
  venue: null,
  playersPerTeam: 11,
  referees: [],
  isMyTeamPlayersSelected: false,
  isOpponentPlayersSelected: false,
  areCaptainsSelected: false,
  matchSettings: null,
  areSubstitutesSelected: false,
  currentStep: 'team-selection',
};

export const useMatchCreationStore = create<MatchCreationState>()(
  devtools(
    immer((set, get) => ({
      matchData: initialMatchData,
      isLoading: false,
      error: null,

      // Initialize match with selected teams
      initializeMatch: (myTeamId, myTeamName, opponentTeamId, opponentTeamName) => set((state) => {
        state.matchData.myTeam.teamId = myTeamId;
        state.matchData.myTeam.teamName = myTeamName;
        state.matchData.opponentTeam.teamId = opponentTeamId;
        state.matchData.opponentTeam.teamName = opponentTeamName;
        state.matchData.currentStep = 'match-details';
        state.error = null;
      }),

      // Update match details from form
      updateMatchDetails: (venue, playersPerTeam, referees) => set((state) => {
        state.matchData.venue = venue;
        state.matchData.playersPerTeam = playersPerTeam;
        state.matchData.referees = referees;
        state.matchData.currentStep = 'my-players';
        state.error = null;
      }),

      // Update my team players
      updateMyTeamPlayers: (playerIds) => set((state) => {
        state.matchData.myTeam.selectedPlayers = playerIds;
        state.matchData.isMyTeamPlayersSelected = true;
        state.matchData.currentStep = 'opponent-players';
        state.error = null;
      }),

      // Update opponent team players
      updateOpponentTeamPlayers: (playerIds) => set((state) => {
        state.matchData.opponentTeam.selectedPlayers = playerIds;
        state.matchData.isOpponentPlayersSelected = true;
        state.matchData.currentStep = 'captains';
        state.error = null;
      }),

      // Update captains for both teams
      updateCaptains: (myTeamCaptain, opponentTeamCaptain, myTeamViceCaptain, opponentTeamViceCaptain) => set((state) => {
        state.matchData.myTeam.captain = myTeamCaptain;
        state.matchData.opponentTeam.captain = opponentTeamCaptain;
        if (myTeamViceCaptain) state.matchData.myTeam.viceCaptain = myTeamViceCaptain;
        if (opponentTeamViceCaptain) state.matchData.opponentTeam.viceCaptain = opponentTeamViceCaptain;
        state.matchData.areCaptainsSelected = true;
        state.matchData.currentStep = 'final-details';
        state.error = null;
      }),

      // Update match settings (final details)
      updateMatchSettings: (settings) => set((state) => {
        state.matchData.matchSettings = settings;
        // If substitution is not allowed, clear substitutes and mark as complete
        if (!settings.substitutionAllowed) {
          state.matchData.myTeam.substitutes = [];
          state.matchData.opponentTeam.substitutes = [];
          state.matchData.areSubstitutesSelected = true;
          state.matchData.currentStep = 'ready';
        }
        state.error = null;
      }),

      // Update substitutes for both teams
      updateSubstitutes: (myTeamSubstitutes, opponentTeamSubstitutes) => set((state) => {
        state.matchData.myTeam.substitutes = myTeamSubstitutes;
        state.matchData.opponentTeam.substitutes = opponentTeamSubstitutes;
        state.matchData.areSubstitutesSelected = true;
        state.matchData.currentStep = 'ready';
        state.error = null;
      }),

      // Helper to get available substitute players
      getAvailableSubstitutes: (teamId, allPlayers) => {
        const { matchData } = get();
        const team = teamId === matchData.myTeam.teamId ? matchData.myTeam : matchData.opponentTeam;
        
        // Find the team's all players
        const teamData = teamId === matchData.myTeam.teamId ? matchData.myTeam : matchData.opponentTeam;
        
        // Filter out already selected players
        return allPlayers.filter(player => 
          // Player belongs to this team but is not in selected players
          !team.selectedPlayers.includes(player.id) && 
          player.isRegistered
        );
      },

      // Set current step
      setCurrentStep: (step) => set((state) => {
        state.matchData.currentStep = step;
      }),

      // Clear all match data
      clearMatchData: () => set((state) => {
        state.matchData = { ...initialMatchData };
        state.error = null;
        state.isLoading = false;
      }),

      // Get complete match summary
      getMatchSummary: () => {
        return get().matchData;
      },

      // Validation helper
      canProceedToNextStep: () => {
        const { matchData } = get();
        
        switch (matchData.currentStep) {
          case 'team-selection':
            return !!(matchData.myTeam.teamId && matchData.opponentTeam.teamId);
          case 'match-details':
            return !!(matchData.venue && matchData.playersPerTeam > 0 && matchData.referees.length > 0);
          case 'my-players':
            return matchData.myTeam.selectedPlayers.length === matchData.playersPerTeam;
          case 'opponent-players':
            return matchData.opponentTeam.selectedPlayers.length === matchData.playersPerTeam;
          case 'captains':
            return !!(matchData.myTeam.captain && matchData.opponentTeam.captain);
          case 'final-details':
            return !!(matchData.matchSettings);
          default:
            return false;
        }
      },

      // Get current step data
      getCurrentStepData: () => {
        const { matchData } = get();
        
        switch (matchData.currentStep) {
          case 'team-selection':
            return { myTeam: matchData.myTeam, opponentTeam: matchData.opponentTeam };
          case 'match-details':
            return { venue: matchData.venue, playersPerTeam: matchData.playersPerTeam, referees: matchData.referees };
          case 'my-players':
            return { teamId: matchData.myTeam.teamId, selectedPlayers: matchData.myTeam.selectedPlayers };
          case 'opponent-players':
            return { teamId: matchData.opponentTeam.teamId, selectedPlayers: matchData.opponentTeam.selectedPlayers };
          case 'captains':
            return { 
              myTeamCaptain: matchData.myTeam.captain, 
              opponentTeamCaptain: matchData.opponentTeam.captain,
              myTeamViceCaptain: matchData.myTeam.viceCaptain,
              opponentTeamViceCaptain: matchData.opponentTeam.viceCaptain
            };
          case 'final-details':
            return { matchSettings: matchData.matchSettings };
          default:
            return null;
        }
      },

      // Error handling
      setError: (error) => set((state) => {
        state.error = error;
      }),

      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),
    })),
    {
      name: 'match-creation-store',
    }
  )
);