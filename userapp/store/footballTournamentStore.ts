import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// Tournament Types
export type TournamentFormat = 'league';
export type TournamentStage = 'group';

// Tournament Match Event (Legacy/Display purposes)
export interface TournamentMatchEvent {
  id: string;
  teamId: string;
  eventType: 'goal' | 'card' | 'substitution' | 'foul' | 'corner' | 'offside';
  eventSubType?: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  minute: number;
  seconds : number;
  isExtraTime: boolean;
  description?: string;
  timestamp: Date;
}

// Active Tournament Match State (Staging for Setup)
export interface ActiveTournamentMatch {
  fixtureId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  
  // Players
  homeTeamPlayers: string[]; // Starter IDs
  awayTeamPlayers: string[]; // Starter IDs
  
  // NEW: Substitutes
  homeTeamSubstitutes: string[]; // Bench IDs
  awayTeamSubstitutes: string[]; // Bench IDs
  
  homeCaptain?: string;
  awayCaptain?: string;
  referees: string[];
  events: TournamentMatchEvent[];
  homeScore: number;
  awayScore: number;
  startTime: Date;
  currentMinute: number;
  status: 'setup' | 'playing' | 'finished';
}

export interface TournamentTeam {
  id: string;
  teamName: string;
  teamId: string;
  tableId?: string;
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number;
}

export interface TournamentTable {
  id: string;
  name: string;
  teamIds: string[];
}

export interface TournamentFixture {
  id: string;
  stage: TournamentStage;
  round: number;
  roundName?: string;
  matchNumber: number;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  tableId?: string;
  scheduledDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
  homeScore?: number;
  awayScore?: number;
  matchData?: any;
  venue?: string;
}

export interface TournamentSettings {
  venue: string;
  numberOfPlayers: number;
  numberOfSubstitutes: number;
  numberOfReferees: number;
  matchDuration: number;
  format: TournamentFormat;
  winPoints?: number; 
  drawPoints?: number; 
  lossPoints?: number; 
  matchesPerPair?: 1 | 2;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  settings: TournamentSettings;
  teams: TournamentTeam[];
  tables: TournamentTable[]; 
  fixtures: TournamentFixture[];
  currentStage: TournamentStage;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  currentRound: number;
  totalRounds: number;
  startDate?: Date;
  endDate?: Date;
  winner?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TournamentCreationDraft {
  name: string;
  description?: string;
  format: TournamentFormat;
  teamCount: number; 
  tableCount?: number;
  enforceEvenTeams?: boolean; 
  settings: Partial<TournamentSettings>;
  selectedTeamIds: string[];
  teamTableAssignments?: Record<string, string>; 
}

interface TournamentState {
  tournaments: Tournament[];
  activeTournament: Tournament | null;
  creationDraft: TournamentCreationDraft | null;
  activeTournamentMatch: ActiveTournamentMatch | null;
  
  // Creation Flow
  startTournamentCreation: (name: string) => void;
  updateCreationDraft: (updates: Partial<TournamentCreationDraft>) => void;
  addTeamToDraft: (teamId: string) => void;
  removeTeamFromDraft: (teamId: string) => void;
  assignTeamToTable: (teamId: string, tableId: string) => void;
  setTournamentSettings: (settings: TournamentSettings) => void;
  createTournament: () => string | null;
  cancelTournamentCreation: () => void;
  
  // Tournament Management
  generateFixtures: (tournamentId: string) => void;
  generateGroupStageFixtures: (tournamentId: string) => void;
  startTournament: (tournamentId: string) => void;
  
  // Match Setup (Staging)
  initializeTournamentMatch: (tournamentId: string, fixtureId: string) => {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
  } | null;
  setTournamentMatchPlayers: (homePlayerIds: string[], awayPlayerIds: string[]) => void;
  
  // NEW: Set Substitutes
  setTournamentMatchSubstitutes: (homeSubIds: string[], awaySubIds: string[]) => void;
  
  setTournamentMatchCaptains: (homeCaptain: string, awayCaptain: string) => void;
  setTournamentMatchReferees: (referees: string[]) => void;
  
  // Handover & Result Logic
  startTournamentMatchScoring: () => void;
  addTournamentMatchEvent: (event: Omit<TournamentMatchEvent, 'id' | 'timestamp'>) => void;
  submitMatchResult: (fixtureId: string, homeScore: number, awayScore: number, matchEvents: any[]) => void;
  
  endTournamentMatch: () => void;
  cancelTournamentMatch: () => void;
  
  // Queries
  getTournament: (tournamentId: string) => Tournament | null;
  getTournamentFixtures: (tournamentId: string) => TournamentFixture[];
  getTournamentTable: (tournamentId: string, tableId: string) => TournamentTeam[];
  getTournamentStandings: (tournamentId: string) => TournamentTeam[];
  getUpcomingFixtures: (tournamentId: string) => TournamentFixture[];
  getCompletedFixtures: (tournamentId: string) => TournamentFixture[];
  getFixturesByRound: (tournamentId: string, round: number) => TournamentFixture[];
  
  // Management
  deleteTournament: (tournamentId: string) => void;
  clearAllTournaments: () => void;
}

// Helpers
const generateLeagueFixtures = (tournament: Tournament): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  if (!tournament.tables || tournament.tables.length === 0) return fixtures;
  
  const matchesPerPair = tournament.settings?.matchesPerPair ?? 1;
  let matchNumber = 1;
  
  for (const table of tournament.tables) {
    const teamIds = table.teamIds.slice();
    const numTeams = teamIds.length;
    if (numTeams < 2) continue;
    
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        const homeTeam = tournament.teams.find(t => t.id === teamIds[i]);
        const awayTeam = tournament.teams.find(t => t.id === teamIds[j]);
        if (!homeTeam || !awayTeam) continue;
        
        for (let match = 0; match < matchesPerPair; match++) {
          const isReturnFixture = match === 1;
          fixtures.push({
            id: `fixture_${Date.now()}_${table.id}_${matchNumber}`,
            stage: 'group',
            round: isReturnFixture ? 2 : 1,
            roundName: `${table.name} - Round ${isReturnFixture ? 2 : 1}`,
            matchNumber,
            homeTeamId: isReturnFixture ? awayTeam.id : homeTeam.id,
            awayTeamId: isReturnFixture ? homeTeam.id : awayTeam.id,
            homeTeamName: isReturnFixture ? awayTeam.teamName : homeTeam.teamName,
            awayTeamName: isReturnFixture ? homeTeam.teamName : awayTeam.teamName,
            tableId: table.id,
            status: 'upcoming',
          });
          matchNumber++;
        }
      }
    }
  }
  return fixtures;
};

const updateStandings = (
  teams: TournamentTeam[],
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number,
  settings?: TournamentSettings
): TournamentTeam[] => {
  const winPoints = settings?.winPoints ?? 3;
  const drawPoints = settings?.drawPoints ?? 1;
  const lossPoints = settings?.lossPoints ?? 0;
  return teams.map(team => {
    if (team.id === homeTeamId) {
      const won = homeScore > awayScore ? 1 : 0;
      const drawn = homeScore === awayScore ? 1 : 0;
      const lost = homeScore < awayScore ? 1 : 0;
      return {
        ...team,
        played: team.played + 1,
        won: team.won + won,
        drawn: team.drawn + drawn,
        lost: team.lost + lost,
        goalsFor: team.goalsFor + homeScore,
        goalsAgainst: team.goalsAgainst + awayScore,
        goalDifference: (team.goalsFor + homeScore) - (team.goalsAgainst + awayScore),
        points: team.points + (won * winPoints) + (drawn * drawPoints) + (lost * lossPoints),
      };
    } else if (team.id === awayTeamId) {
      const won = awayScore > homeScore ? 1 : 0;
      const drawn = awayScore === homeScore ? 1 : 0;
      const lost = awayScore < homeScore ? 1 : 0;
      return {
        ...team,
        played: team.played + 1,
        won: team.won + won,
        drawn: team.drawn + drawn,
        lost: team.lost + lost,
        goalsFor: team.goalsFor + awayScore,
        goalsAgainst: team.goalsAgainst + homeScore,
        goalDifference: (team.goalsFor + awayScore) - (team.goalsAgainst + homeScore),
        points: team.points + (won * winPoints) + (drawn * drawPoints) + (lost * lossPoints),
      };
    }
    return team;
  });
};

export const useTournamentStore = create<TournamentState>()(
  devtools(
    persist(
      immer((set, get) => ({
        tournaments: [],
        activeTournament: null,
        creationDraft: null,
        activeTournamentMatch: null,

        startTournamentCreation: (name) => set((state) => {
          state.creationDraft = {
            name,
            format: 'league',
            teamCount: 8,
            enforceEvenTeams: false,
            settings: {
              venue: '',
              numberOfPlayers: 11,
              numberOfSubstitutes: 5,
              numberOfReferees: 1,
              matchDuration: 90,
              winPoints: 3,
              drawPoints: 1,
              lossPoints: 0,
              matchesPerPair: 1,
              format: 'league',
            },
            selectedTeamIds: [],
          };
        }),

        updateCreationDraft: (updates) => set((state) => {
          if (state.creationDraft) {
            Object.assign(state.creationDraft, updates);
          }
        }),

        addTeamToDraft: (teamId) => set((state) => {
          if (state.creationDraft && !state.creationDraft.selectedTeamIds.includes(teamId)) {
            state.creationDraft.selectedTeamIds.push(teamId);
          }
        }),

        removeTeamFromDraft: (teamId) => set((state) => {
          if (state.creationDraft) {
            state.creationDraft.selectedTeamIds = state.creationDraft.selectedTeamIds.filter(id => id !== teamId);
          }
        }),

        assignTeamToTable: (teamId, tableId) => set((state) => {
          if (state.creationDraft) {
            if (!state.creationDraft.teamTableAssignments) {
              state.creationDraft.teamTableAssignments = {};
            }
            state.creationDraft.teamTableAssignments[teamId] = tableId;
          }
        }),

        setTournamentSettings: (settings) => set((state) => {
          if (state.creationDraft) {
            state.creationDraft.settings = settings;
          }
        }),

        createTournament: () => {
          const state = get();
          const draft = state.creationDraft;
          if (!draft || draft.selectedTeamIds.length < draft.teamCount) return null;
          
          const footballStore = useFootballStore.getState();
          const actualTeams = draft.selectedTeamIds
            .map(teamId => footballStore.getTeamById(teamId))
            .filter(team => team !== undefined) as any[];

          const tournamentId = `tournament_${Date.now()}`;
          const tables: TournamentTable[] = [];
          tables.push({
            id: `table_main_${Date.now()}`,
            name: 'League Table',
            teamIds: [],
          });

          const teams: TournamentTeam[] = actualTeams.slice(0, draft.teamCount).map((team: any, index: number) => {
            const teamObj: TournamentTeam = {
              id: `tourney_team_${team.id}_${Date.now()}_${index}`,
              teamId: team.id,
              teamName: team.teamName,
              logoUrl: team.logoUrl,
              played: 0,
              won: 0,
              drawn: 0,
              lost: 0,
              goalsFor: 0,
              goalsAgainst: 0,
              goalDifference: 0,
              points: 0,
            };
            teamObj.tableId = tables[0].id;
            tables[0].teamIds.push(teamObj.id);
            return teamObj;
          });

          const tournament: Tournament = {
            id: tournamentId,
            name: draft.name,
            description: draft.description,
            format: 'league',
            settings: {
              ...draft.settings as TournamentSettings,
              format: 'league',
              winPoints: draft.settings?.winPoints ?? 3,
              drawPoints: draft.settings?.drawPoints ?? 1,
              lossPoints: draft.settings?.lossPoints ?? 0,
              matchesPerPair: (draft.settings?.matchesPerPair as 1 | 2) || 1,
            },
            teams,
            tables,
            fixtures: [],
            currentStage: 'group',
            status: 'draft',
            currentRound: 0,
            totalRounds: 1,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => {
            state.tournaments.push(tournament);
            state.creationDraft = null;
          });

          get().generateFixtures(tournamentId);
          return tournamentId;
        },

        cancelTournamentCreation: () => set((state) => {
          state.creationDraft = null;
        }),

        generateFixtures: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament) return;
          const groupFixtures = generateLeagueFixtures(tournament);
          tournament.fixtures = groupFixtures;
          tournament.totalRounds = 1;
          tournament.currentRound = 1;
          tournament.currentStage = 'group';
          tournament.updatedAt = new Date();
        }),

        generateGroupStageFixtures: (tournamentId) => set((state) => {
           const tournament = state.tournaments.find(t => t.id === tournamentId);
           if (!tournament) return;
           const groupFixtures = generateLeagueFixtures(tournament);
           tournament.fixtures = groupFixtures;
           tournament.updatedAt = new Date();
        }),

        startTournament: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (tournament) {
            tournament.status = 'active';
            tournament.startDate = new Date();
            tournament.updatedAt = new Date();
          }
        }),

        initializeTournamentMatch: (tournamentId, fixtureId) => {
          const state = get();
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament) return null;
          const fixture = tournament.fixtures.find(f => f.id === fixtureId);
          if (!fixture || !fixture.homeTeamId || !fixture.awayTeamId) return null;
          
          set((state) => {
            state.activeTournamentMatch = {
              fixtureId,
              tournamentId,
              homeTeamId: fixture.homeTeamId!,
              awayTeamId: fixture.awayTeamId!,
              homeTeamName: fixture.homeTeamName,
              awayTeamName: fixture.awayTeamName,
              homeTeamPlayers: [],
              awayTeamPlayers: [],
              homeTeamSubstitutes: [], // Initialize empty
              awayTeamSubstitutes: [], // Initialize empty
              referees: [],
              events: [],
              homeScore: 0,
              awayScore: 0,
              startTime: new Date(),
              currentMinute: 0,
              status: 'setup',
            };
          });
          
          return {
            homeTeamId: fixture.homeTeamId,
            awayTeamId: fixture.awayTeamId,
            homeTeamName: fixture.homeTeamName,
            awayTeamName: fixture.awayTeamName,
          };
        },

        setTournamentMatchPlayers: (homePlayerIds, awayPlayerIds) => set((state) => {
          if (state.activeTournamentMatch) {
            state.activeTournamentMatch.homeTeamPlayers = homePlayerIds;
            state.activeTournamentMatch.awayTeamPlayers = awayPlayerIds;
          }
        }),

        // NEW: Action to save substitutes
        setTournamentMatchSubstitutes: (homeSubIds, awaySubIds) => set((state) => {
          if (state.activeTournamentMatch) {
            state.activeTournamentMatch.homeTeamSubstitutes = homeSubIds;
            state.activeTournamentMatch.awayTeamSubstitutes = awaySubIds;
          }
        }),

        setTournamentMatchCaptains: (homeCaptain, awayCaptain) => set((state) => {
          if (state.activeTournamentMatch) {
            state.activeTournamentMatch.homeCaptain = homeCaptain;
            state.activeTournamentMatch.awayCaptain = awayCaptain;
          }
        }),

        setTournamentMatchReferees: (referees) => set((state) => {
          if (state.activeTournamentMatch) {
            state.activeTournamentMatch.referees = referees;
          }
        }),

        startTournamentMatchScoring: () => set((state) => {
          if (state.activeTournamentMatch) {
            state.activeTournamentMatch.status = 'playing';
          }
        }),

        addTournamentMatchEvent: (eventData) => set((state) => {
          if (!state.activeTournamentMatch) return;
          const newEvent: TournamentMatchEvent = {
            ...eventData,
            id: `event_${Date.now()}`,
            timestamp: new Date(),
            seconds: 0,
          };
          state.activeTournamentMatch.events.push(newEvent);
          
          if (newEvent.eventType === 'goal') {
             const isHome = newEvent.teamId === state.activeTournamentMatch.homeTeamId;
             const isOwn = newEvent.eventSubType === 'own_goal';
             if (isOwn) {
                if (isHome) state.activeTournamentMatch.awayScore++;
                else state.activeTournamentMatch.homeScore++;
             } else {
                if (isHome) state.activeTournamentMatch.homeScore++;
                else state.activeTournamentMatch.awayScore++;
             }
          }
        }),

        submitMatchResult: (fixtureId, homeScore, awayScore, matchEvents) => set((state) => {
            const tournament = state.tournaments.find(t => t.fixtures.some(f => f.id === fixtureId));
            if (!tournament) return;

            const fixture = tournament.fixtures.find(f => f.id === fixtureId);
            if (!fixture) return;

            fixture.status = 'completed';
            fixture.homeScore = homeScore;
            fixture.awayScore = awayScore;
            fixture.matchData = { events: matchEvents };

            tournament.teams = updateStandings(
              tournament.teams,
              fixture.homeTeamId,
              fixture.awayTeamId,
              homeScore,
              awayScore,
              tournament.settings
            );

            const groupFixtures = tournament.fixtures.filter(f => f.stage === 'group');
            const allCompleted = groupFixtures.every(f => f.status === 'completed');
            if (allCompleted) {
                tournament.status = 'completed';
                tournament.endDate = new Date();
                const winner = [...tournament.teams].sort((a, b) => b.points - a.points)[0];
                tournament.winner = winner?.teamName;
            }

            tournament.updatedAt = new Date();
            state.activeTournamentMatch = null;
        }),

        endTournamentMatch: () => set((state) => {
           state.activeTournamentMatch = null;
        }),

        cancelTournamentMatch: () => set((state) => {
          state.activeTournamentMatch = null;
        }),

        // Queries
        getTournament: (tournamentId) => get().tournaments.find(t => t.id === tournamentId) || null,
        getTournamentFixtures: (tournamentId) => {
            const tournament = get().tournaments.find(t => t.id === tournamentId);
            return tournament?.fixtures || [];
        },
        getTournamentTable: (tournamentId, tableId) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          if (!tournament) return [];
          const teams = tournament.teams.filter(team => team.tableId === tableId);
          return [...teams].sort((a, b) => {
            if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
            if ((b.goalDifference || 0) !== (a.goalDifference || 0)) return (b.goalDifference || 0) - (a.goalDifference || 0);
            if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
            return 0;
          });
        },
        getTournamentStandings: (tournamentId) => {
             const tournament = get().tournaments.find(t => t.id === tournamentId);
             if (!tournament) return [];
             return [...tournament.teams].sort((a, b) => (b.points || 0) - (a.points || 0));
        },
        getUpcomingFixtures: (tournamentId) => {
            const tournament = get().tournaments.find(t => t.id === tournamentId);
            return tournament?.fixtures.filter(f => f.status === 'upcoming') || [];
        },
        getCompletedFixtures: (tournamentId) => {
            const tournament = get().tournaments.find(t => t.id === tournamentId);
            return tournament?.fixtures.filter(f => f.status === 'completed') || [];
        },
        getFixturesByRound: (tournamentId, round) => {
            const tournament = get().tournaments.find(t => t.id === tournamentId);
            return tournament?.fixtures.filter(f => f.round === round) || [];
        },

        deleteTournament: (tournamentId) => set((state) => {
          if (state.activeTournamentMatch?.tournamentId === tournamentId) {
            state.activeTournamentMatch = null;
          }
          if (state.activeTournament?.id === tournamentId) {
            state.activeTournament = null;
          }
          state.tournaments = state.tournaments.filter(t => t.id !== tournamentId);
        }),
        
        clearAllTournaments: () => set((state) => {
          state.tournaments = [];
          state.activeTournament = null;
          state.activeTournamentMatch = null;
        }),
      })),
      {
        name: 'tournament-storage',
      }
    ),
    {
      name: 'tournament-store',
    }
  )
);