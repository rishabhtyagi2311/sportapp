// /store/footballTournamentStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// Tournament Types
export type TournamentFormat = 'league';
export type TournamentStage = 'group';

// Tournament Match Event (separate from regular match events)
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

// Active Tournament Match State
export interface ActiveTournamentMatch {
  fixtureId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamPlayers: string[]; // Player IDs
  awayTeamPlayers: string[]; // Player IDs
  homeCaptain?: string;
  awayCaptain?: string;
  referees: string[]; // Referee names
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
  teamId: string; // Reference to original team in football store
  tableId?: string; // Reference to which table/group the team belongs to
  logoUrl?: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  position?: number; // Position in table
}

export interface TournamentTable {
  id: string;
  name: string;
  teamIds: string[]; // Teams in this table/group
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
  tableId?: string; // Which table/group this fixture belongs to
  scheduledDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
  homeScore?: number;
  awayScore?: number;
  matchData?: any; // Stored match data after completion
  venue?: string;
}

export interface TournamentSettings {
  venue: string;
  numberOfPlayers: number;
  numberOfSubstitutes: number;
  numberOfReferees: number;
  matchDuration: number;
  format: TournamentFormat;
  // League specific scoring settings
  winPoints?: number; // default 3
  drawPoints?: number; // default 1
  lossPoints?: number; // default 0
  // matchesPerPair: 1 => single round-robin, 2 => double (home & away)
  matchesPerPair?: 1 | 2;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  settings: TournamentSettings;
  teams: TournamentTeam[];
  tables: TournamentTable[]; // Groups for league format
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
  teamCount: number; // Number of teams in tournament
  tableCount?: number;
  enforceEvenTeams?: boolean; // if true, require even team count
  settings: Partial<TournamentSettings>;
  selectedTeamIds: string[];
  teamTableAssignments?: Record<string, string>; // teamId -> tableId (kept for compatibility)
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
  // Tournament Match Flow
  initializeTournamentMatch: (tournamentId: string, fixtureId: string) => {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
  } | null;
  setTournamentMatchPlayers: (homePlayerIds: string[], awayPlayerIds: string[]) => void;
  setTournamentMatchCaptains: (homeCaptain: string, awayCaptain: string) => void;
  setTournamentMatchReferees: (referees: string[]) => void;
  startTournamentMatchScoring: () => void;
  addTournamentMatchEvent: (event: Omit<TournamentMatchEvent, 'id' | 'timestamp'>) => void;
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

// --- Single-round league fixture generator ---
// Create exactly one fixture per unordered pair (i < j) for every table.
// All fixtures are round = 1.
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
        
        // Generate matchesPerPair fixtures
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
              // league scoring defaults
              winPoints: 3,
              drawPoints: 1,
              lossPoints: 0,
              // default single round-robin (kept for compatibility)
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
            if (state.creationDraft.teamTableAssignments) {
              delete state.creationDraft.teamTableAssignments[teamId];
            }
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
          if (draft.enforceEvenTeams && (draft.teamCount % 2 !== 0)) {
            console.error('Even number of teams required');
            return null;
          }
          const footballStore = useFootballStore.getState();
          const actualTeams = draft.selectedTeamIds
            .map(teamId => footballStore.getTeamById(teamId))
            .filter(team => team !== undefined) as any[];
          if (actualTeams.length < 2) {
            console.error('Could not find all selected teams in football store');
            return null;
          }
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
          tournament.currentStage = 'group';
          tournament.currentRound = 1;
          tournament.totalRounds = 1;
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
            state.activeTournamentMatch.startTime = new Date();
          }
        }),
        addTournamentMatchEvent: (eventData) => set((state) => {
          if (!state.activeTournamentMatch) return;
          const newEvent: TournamentMatchEvent = {
            ...eventData,
            id: `event_${Date.now()}`,
            timestamp: new Date(),
          };
          state.activeTournamentMatch.events.push(newEvent);
          state.activeTournamentMatch.events.sort((a, b) => a.minute - b.minute);
          if (newEvent.eventType === 'goal') {
            const isHomeTeam = newEvent.teamId === state.activeTournamentMatch.homeTeamId;
            const isOwnGoal = newEvent.eventSubType === 'own_goal';
            if (isOwnGoal) {
              if (isHomeTeam) {
                state.activeTournamentMatch.awayScore += 1;
              } else {
                state.activeTournamentMatch.homeScore += 1;
              }
            } else {
              if (isHomeTeam) {
                state.activeTournamentMatch.homeScore += 1;
              } else {
                state.activeTournamentMatch.awayScore += 1;
              }
            }
          }
        }),
        endTournamentMatch: () => set((state) => {
          if (!state.activeTournamentMatch) return;
          const match = state.activeTournamentMatch;
          const tournament = state.tournaments.find(t => t.id === match.tournamentId);
          if (!tournament) return;
          const fixture = tournament.fixtures.find(f => f.id === match.fixtureId);
          if (!fixture) return;
          fixture.status = 'completed';
          fixture.homeScore = match.homeScore;
          fixture.awayScore = match.awayScore;
          fixture.matchData = { ...match };
          tournament.teams = updateStandings(
            tournament.teams,
            match.homeTeamId,
            match.awayTeamId,
            match.homeScore,
            match.awayScore,
            tournament.settings
          );
          tournament.updatedAt = new Date();
          const groupFixtures = tournament.fixtures.filter(f => f.stage === 'group');
          const allGroupCompleted = groupFixtures.every(f => f.status === 'completed');
          if (allGroupCompleted) {
            tournament.status = 'completed';
            tournament.endDate = new Date();
            const winner = [...tournament.teams].sort((a, b) => b.points - a.points)[0];
            tournament.winner = winner?.teamName;
          }
          state.activeTournamentMatch = null;
        }),
        cancelTournamentMatch: () => set((state) => {
          state.activeTournamentMatch = null;
        }),
        // Queries
        getTournament: (tournamentId) => {
          return get().tournaments.find(t => t.id === tournamentId) || null;
        },
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
            const aAvg = a.goalsAgainst > 0 ? a.goalsFor / a.goalsAgainst : a.goalsFor;
            const bAvg = b.goalsAgainst > 0 ? b.goalsFor / b.goalsAgainst : b.goalsFor;
            return bAvg - aAvg;
          });
        },
        getTournamentStandings: (tournamentId) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          if (!tournament) return [];
          return [...tournament.teams].sort((a, b) => {
            if ((b.points || 0) !== (a.points || 0)) return (b.points || 0) - (a.points || 0);
            if ((b.goalDifference || 0) !== (a.goalDifference || 0)) return (b.goalDifference || 0) - (a.goalDifference || 0);
            if ((b.goalsFor || 0) !== (a.goalsFor || 0)) return (b.goalsFor || 0) - (a.goalsFor || 0);
            const aAvg = a.goalsAgainst > 0 ? a.goalsFor / a.goalsAgainst : a.goalsFor;
            const bAvg = b.goalsAgainst > 0 ? b.goalsFor / b.goalsAgainst : b.goalsFor;
            return bAvg - aAvg;
          });
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