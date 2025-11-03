// stores/tournamentStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// Tournament Types
export type TournamentFormat = 'league' | 'knockout';
export type TournamentStage = 'group' | 'quarterfinals' | 'semifinals' | 'final';

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
  isEliminated?: boolean; // For knockout tournaments
  position?: number; // Position in group/table, used for knockout qualification
}

export interface TournamentTable {
  id: string;
  name: string;
  teamIds: string[]; // Teams in this table/group
}

export interface TournamentFixture {
  id: string;
  stage: TournamentStage; // 'group', 'quarterfinals', 'semifinals', 'final'
  round: number;
  roundName?: string; // E.g., "Quarter Finals", "Semi Finals", "Final"
  matchNumber: number;
  homeTeamId: string | null; // null for TBD teams in knockout
  awayTeamId: string | null; // null for TBD teams in knockout
  homeTeamName: string;
  awayTeamName: string;
  tableId?: string; // Which table/group this fixture belongs to (for group stage)
  scheduledDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
  homeScore?: number;
  awayScore?: number;
  winnerId?: string; // For knockout tournaments
  matchData?: any; // Stored match data after completion
  venue?: string;
  previousMatchIds?: string[]; // For knockout: which matches feed into this one
}

export interface TournamentSettings {
  venue: string;
  numberOfPlayers: number;
  numberOfSubstitutes: number;
  numberOfReferees: number;
  matchDuration: number;
  format: TournamentFormat;
  includeKnockoutStage?: boolean; // For league format, whether to include knockout rounds
  advancingTeamsPerTable?: number; // How many teams advance from each group
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
  tableCount: number; // Number of tables/groups
  includeKnockoutStage: boolean; // For league format
  settings: Partial<TournamentSettings>;
  selectedTeamIds: string[];
  teamTableAssignments?: Record<string, string>; // teamId -> tableId
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
  generateKnockoutStageFixtures: (tournamentId: string) => void;
  startTournament: (tournamentId: string) => void;
  advanceToKnockoutStage: (tournamentId: string) => void;
  
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
  getTournamentFixturesByStage: (tournamentId: string, stage: TournamentStage) => TournamentFixture[];
  getTournamentTable: (tournamentId: string, tableId: string) => TournamentTeam[];
  getTournamentStandings: (tournamentId: string) => TournamentTeam[];
  getUpcomingFixtures: (tournamentId: string) => TournamentFixture[];
  getCompletedFixtures: (tournamentId: string) => TournamentFixture[];
  getFixturesByRound: (tournamentId: string, round: number) => TournamentFixture[];

  // Management
  deleteTournament: (tournamentId: string) => void;
  clearAllTournaments: () => void;
}

// Helper function to get knockout round name
const getKnockoutRoundName = (stage: TournamentStage): string => {
  switch (stage) {
    case 'quarterfinals':
      return 'Quarter Finals';
    case 'semifinals':
      return 'Semi Finals';
    case 'final':
      return 'Final';
    default:
      return 'Group Stage';
  }
};

// Helper Functions for League Format
const generateLeagueFixtures = (tournament: Tournament): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  
  // Process each table separately
  tournament.tables.forEach(table => {
    const teamIds = table.teamIds;
    const numTeams = teamIds.length;
    
    if (numTeams < 2) return;

    let matchNumber = 1;
    let currentRound = 1;

    // Generate fixtures within this table (single round-robin)
    for (let i = 0; i < numTeams; i++) {
      for (let j = i + 1; j < numTeams; j++) {
        const homeTeam = tournament.teams.find(t => t.id === teamIds[i]);
        const awayTeam = tournament.teams.find(t => t.id === teamIds[j]);
        
        if (!homeTeam || !awayTeam) continue;
        
        fixtures.push({
          id: `fixture_${Date.now()}_${table.id}_${matchNumber}`,
          stage: 'group',
          round: currentRound,
          roundName: `${table.name} - Matchday ${currentRound}`,
          matchNumber,
          homeTeamId: homeTeam.id,
          awayTeamId: awayTeam.id,
          homeTeamName: homeTeam.teamName,
          awayTeamName: awayTeam.teamName,
          tableId: table.id,
          status: 'upcoming',
        });
        matchNumber++;

        // Increment round after every set of matches
        if (matchNumber % Math.ceil(numTeams / 2) === 1 && matchNumber > 1) {
          currentRound++;
        }
      }
    }
  });

  return fixtures;
};

// Helper Functions for Knockout Format
const generateKnockoutFixtures = (teams: TournamentTeam[]): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const numTeams = teams.length;

  // Determine the stage based on number of teams
  let stage: TournamentStage = 'quarterfinals';
  if (numTeams <= 4) {
    stage = 'semifinals';
  } else if (numTeams === 2) {
    stage = 'final';
  }

  let matchNumber = 1;

  // Generate first round of knockout
  for (let i = 0; i < numTeams; i += 2) {
    if (i + 1 < numTeams) {
      fixtures.push({
        id: `fixture_${Date.now()}_knockout_${matchNumber}`,
        stage,
        round: 1,
        roundName: getKnockoutRoundName(stage),
        matchNumber,
        homeTeamId: teams[i].id,
        awayTeamId: teams[i + 1].id,
        homeTeamName: teams[i].teamName,
        awayTeamName: teams[i + 1].teamName,
        status: 'upcoming',
      });
      matchNumber++;
    } else {
      // Bye - team automatically advances
      fixtures.push({
        id: `fixture_${Date.now()}_knockout_${matchNumber}`,
        stage,
        round: 1,
        roundName: getKnockoutRoundName(stage),
        matchNumber,
        homeTeamId: teams[i].id,
        awayTeamId: null,
        homeTeamName: teams[i].teamName,
        awayTeamName: 'BYE',
        status: 'completed',
        homeScore: 1,
        awayScore: 0,
        winnerId: teams[i].id,
      });
      matchNumber++;
    }
  }

  return fixtures;
};

// Generate knockout stage fixtures from group qualifiers
const generateKnockoutStageFixturesFromGroups = (tournament: Tournament): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const { settings, tables, teams } = tournament;
  
  // Default to 2 teams advancing per table if not specified
  const advancingPerTable = settings.advancingTeamsPerTable || 2;
  
  // Get the top teams from each table
  const qualifiedTeams: TournamentTeam[] = [];
  
  tables.forEach(table => {
    // Get teams in this table and sort by standings
    const tableTeams = teams
      .filter(team => team.tableId === table.id)
      .sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });
    
    // Take top teams based on advancingPerTable
    qualifiedTeams.push(...tableTeams.slice(0, advancingPerTable));
  });
  
  // Determine the stage based on qualified team count
  let stage: TournamentStage = 'quarterfinals';
  if (qualifiedTeams.length <= 4) {
    stage = 'semifinals';
  } else if (qualifiedTeams.length === 2) {
    stage = 'final';
  }
  
  // Create fixtures from qualified teams
  let matchNumber = 1;
  for (let i = 0; i < qualifiedTeams.length; i += 2) {
    if (i + 1 < qualifiedTeams.length) {
      fixtures.push({
        id: `fixture_${Date.now()}_knockout_${matchNumber}`,
        stage,
        round: 1,
        roundName: getKnockoutRoundName(stage),
        matchNumber,
        homeTeamId: qualifiedTeams[i].id,
        awayTeamId: qualifiedTeams[i + 1].id,
        homeTeamName: qualifiedTeams[i].teamName,
        awayTeamName: qualifiedTeams[i + 1].teamName,
        status: 'upcoming',
      });
      matchNumber++;
    } else {
      // If odd number of teams, give a bye
      fixtures.push({
        id: `fixture_${Date.now()}_knockout_${matchNumber}`,
        stage,
        round: 1,
        roundName: getKnockoutRoundName(stage),
        matchNumber,
        homeTeamId: qualifiedTeams[i].id,
        awayTeamId: null,
        homeTeamName: qualifiedTeams[i].teamName,
        awayTeamName: 'BYE',
        status: 'completed',
        homeScore: 1,
        awayScore: 0,
        winnerId: qualifiedTeams[i].id,
      });
      matchNumber++;
    }
  }
  
  return fixtures;
};

// Generate next knockout round fixtures
const generateNextKnockoutRoundFixtures = (
  tournament: Tournament,
  currentStage: TournamentStage
): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const currentStageFixtures = tournament.fixtures.filter(f => f.stage === currentStage);

  // Get winners from current stage
  const winners = currentStageFixtures
    .filter(f => f.status === 'completed' && f.winnerId)
    .map(f => {
      const winnerTeam = tournament.teams.find(t => t.id === f.winnerId);
      return {
        id: f.winnerId!,
        name: winnerTeam?.teamName || 'Unknown',
        fixtureId: f.id,
      };
    });

  if (winners.length < 2) return fixtures;

  // Determine next stage
  let nextStage: TournamentStage;
  if (currentStage === 'quarterfinals') {
    nextStage = 'semifinals';
  } else if (currentStage === 'semifinals') {
    nextStage = 'final';
  } else {
    return fixtures; // No next stage after final
  }

  let matchNumber = 1;

  // Pair up winners for next stage
  for (let i = 0; i < winners.length; i += 2) {
    if (i + 1 < winners.length) {
      fixtures.push({
        id: `fixture_${Date.now()}_${nextStage}_${matchNumber}`,
        stage: nextStage,
        round: 1, // Reset round counter for each stage
        roundName: getKnockoutRoundName(nextStage),
        matchNumber,
        homeTeamId: winners[i].id,
        awayTeamId: winners[i + 1].id,
        homeTeamName: winners[i].name,
        awayTeamName: winners[i + 1].name,
        status: 'upcoming',
        previousMatchIds: [winners[i].fixtureId, winners[i + 1].fixtureId],
      });
      matchNumber++;
    }
  }

  return fixtures;
};

const updateStandings = (
  teams: TournamentTeam[],
  homeTeamId: string,
  awayTeamId: string,
  homeScore: number,
  awayScore: number
): TournamentTeam[] => {
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
        points: team.points + (won * 3) + drawn,
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
        points: team.points + (won * 3) + drawn,
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
            tableCount: 2,
            includeKnockoutStage: true,
            settings: {
              venue: '',
              numberOfPlayers: 11,
              numberOfSubstitutes: 5,
              numberOfReferees: 1,
              matchDuration: 90,
              advancingTeamsPerTable: 2,
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
            
            // Also remove from table assignments if present
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

          // Get actual team data from football store
          const footballStore = useFootballStore.getState();
          const actualTeams = draft.selectedTeamIds
            .map(teamId => footballStore.getTeamById(teamId))
            .filter(team => team !== undefined);

          if (actualTeams.length < 2) {
            console.error('Could not find all selected teams in football store');
            return null;
          }

          const tournamentId = `tournament_${Date.now()}`;
          
          // Create tables/groups for league format
          const tables: TournamentTable[] = [];
          if (draft.format === 'league' && draft.tableCount > 0) {
            const teamsPerTable = Math.floor(draft.teamCount / draft.tableCount);
            
            for (let i = 0; i < draft.tableCount; i++) {
              tables.push({
                id: `table_${i + 1}_${Date.now()}`,
                name: `Group ${String.fromCharCode(65 + i)}`, // Group A, B, C, etc.
                teamIds: [],
              });
            }
          } else {
            // For knockout format, create a single "table" for all teams
            tables.push({
              id: `table_main_${Date.now()}`,
              name: 'Main Draw',
              teamIds: [],
            });
          }

          // Create tournament teams with actual team data and assign to tables
          const teams: TournamentTeam[] = actualTeams.slice(0, draft.teamCount).map((team, index) => {
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
              isEliminated: false,
            };
            
            // Assign team to table
            if (draft.format === 'league') {
              // If team assignments are specified, use them
              if (draft.teamTableAssignments && draft.teamTableAssignments[team.id]) {
                const tableId = draft.teamTableAssignments[team.id];
                const table = tables.find(t => t.id === tableId);
                if (table) {
                  teamObj.tableId = tableId;
                  table.teamIds.push(teamObj.id);
                }
              } else {
                // Otherwise distribute teams evenly across tables
                const tableIndex = Math.floor(index / Math.floor(draft.teamCount / draft.tableCount));
                if (tableIndex < tables.length) {
                  teamObj.tableId = tables[tableIndex].id;
                  tables[tableIndex].teamIds.push(teamObj.id);
                }
              }
            } else {
              // For knockout, all teams go in the single table
              teamObj.tableId = tables[0].id;
              tables[0].teamIds.push(teamObj.id);
            }
            
            return teamObj;
          });

          // Calculate total rounds based on format
          let totalRounds: number;
          if (draft.format === 'league') {
            // For each table: (n-1) rounds where n is teams per table
            const teamsPerTable = Math.floor(draft.teamCount / draft.tableCount);
            totalRounds = teamsPerTable - 1;
            
            // If including knockout stages, add those rounds
            if (draft.includeKnockoutStage) {
              // Calculate knockout rounds based on teams advancing
              const advancingTeams = draft.tableCount * (draft.settings.advancingTeamsPerTable || 2);
              if (advancingTeams >= 8) totalRounds += 3; // QF, SF, F
              else if (advancingTeams >= 4) totalRounds += 2; // SF, F
              else totalRounds += 1; // F
            }
          } else {
            // Knockout: log2(teams) rounded up
            totalRounds = Math.ceil(Math.log2(draft.teamCount));
          }

          const tournament: Tournament = {
            id: tournamentId,
            name: draft.name,
            description: draft.description,
            format: draft.format,
            settings: {
              ...draft.settings as TournamentSettings,
              format: draft.format,
              includeKnockoutStage: draft.includeKnockoutStage,
              advancingTeamsPerTable: draft.settings.advancingTeamsPerTable || 2,
            },
            teams,
            tables,
            fixtures: [],
            currentStage: 'group', // Always start with group stage (even for knockout format)
            status: 'draft',
            currentRound: 0,
            totalRounds,
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

          // For league format with knockout, generate group stage fixtures first
          if (tournament.format === 'league') {
            const groupFixtures = generateLeagueFixtures(tournament);
            tournament.fixtures = groupFixtures;
          } else {
            // For pure knockout format
            const knockoutFixtures = generateKnockoutFixtures(tournament.teams);
            tournament.fixtures = knockoutFixtures;
          }
          
          tournament.currentRound = 1;
          tournament.currentStage = tournament.format === 'league' ? 'group' : 'quarterfinals';
          tournament.updatedAt = new Date();
        }),
        
        generateGroupStageFixtures: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament || tournament.format !== 'league') return;
          
          const groupFixtures = generateLeagueFixtures(tournament);
          tournament.fixtures = groupFixtures;
          tournament.currentStage = 'group';
          tournament.currentRound = 1;
          tournament.updatedAt = new Date();
        }),
        
        generateKnockoutStageFixtures: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament) return;
          
          let knockoutFixtures: TournamentFixture[] = [];
          
          if (tournament.format === 'league' && tournament.settings.includeKnockoutStage) {
            // For league with knockout stage, generate fixtures from group standings
            knockoutFixtures = generateKnockoutStageFixturesFromGroups(tournament);
          } else if (tournament.format === 'knockout') {
            // For pure knockout format
            knockoutFixtures = generateKnockoutFixtures(tournament.teams);
          }
          
          // If tournament already has fixtures, append new ones
          if (tournament.fixtures.length > 0) {
            tournament.fixtures.push(...knockoutFixtures);
          } else {
            tournament.fixtures = knockoutFixtures;
          }
          
          // Update tournament state
          if (knockoutFixtures.length > 0) {
            tournament.currentStage = knockoutFixtures[0].stage;
            tournament.currentRound = 1; // Reset round for new stage
          }
          
          tournament.updatedAt = new Date();
        }),

        advanceToKnockoutStage: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament || tournament.format !== 'league' || !tournament.settings.includeKnockoutStage) return;
          
          // Check if all group stage matches are completed
          const groupMatches = tournament.fixtures.filter(f => f.stage === 'group');
          const allGroupMatchesCompleted = groupMatches.every(match => match.status === 'completed');
          
          if (!allGroupMatchesCompleted) {
            console.error('Cannot advance to knockout stage until all group matches are completed');
            return;
          }
          
          // Calculate final group standings and positions
          tournament.tables.forEach(table => {
            const tableTeams = tournament.teams
              .filter(team => team.tableId === table.id)
              .sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
                return b.goalsFor - a.goalsFor;
              });
              
            // Set position for each team in group
            tableTeams.forEach((team, index) => {
              const teamIndex = tournament.teams.findIndex(t => t.id === team.id);
              if (teamIndex !== -1) {
                tournament.teams[teamIndex].position = index + 1;
              }
            });
          });
          
          // Generate knockout fixtures
          const knockoutFixtures = generateKnockoutStageFixturesFromGroups(tournament);
          tournament.fixtures.push(...knockoutFixtures);
          
          // Update tournament state
          if (knockoutFixtures.length > 0) {
            tournament.currentStage = knockoutFixtures[0].stage;
            tournament.currentRound = 1; // Reset round for knockout stage
          }
          
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

        // Tournament Match Flow
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

          // Update scores for goals
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

          // Update fixture
          fixture.status = 'completed';
          fixture.homeScore = match.homeScore;
          fixture.awayScore = match.awayScore;
          fixture.matchData = { ...match };

          // Determine winner
          if (match.homeScore > match.awayScore) {
            fixture.winnerId = match.homeTeamId;
          } else if (match.awayScore > match.homeScore) {
            fixture.winnerId = match.awayTeamId;
          } else {
            // In case of draw for knockout matches, home team wins (or implement penalty shootout)
            if (fixture.stage !== 'group') {
              fixture.winnerId = match.homeTeamId;
            }
          }

          // For knockout stages, mark losing team as eliminated
          if (fixture.stage !== 'group') {
            const loserId = fixture.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
            const loserTeam = tournament.teams.find(t => t.id === loserId);
            if (loserTeam) {
              loserTeam.isEliminated = true;
            }
          }

          // Update standings for group stage
          if (fixture.stage === 'group' && fixture.tableId) {
            tournament.teams = updateStandings(
              tournament.teams,
              match.homeTeamId,
              match.awayTeamId,
              match.homeScore,
              match.awayScore
            );
          }

          tournament.updatedAt = new Date();

          // Check if current stage is completed and generate next stage if necessary
          if (fixture.stage !== 'group') {
            const currentStageFixtures = tournament.fixtures.filter(
              f => f.stage === fixture.stage
            );
            const allStageCompleted = currentStageFixtures.every(f => f.status === 'completed');

            if (allStageCompleted) {
              // Generate next stage if not final
              if (fixture.stage !== 'final') {
                const nextRoundFixtures = generateNextKnockoutRoundFixtures(tournament, fixture.stage);
                if (nextRoundFixtures.length > 0) {
                  tournament.fixtures.push(...nextRoundFixtures);
                  tournament.currentStage = nextRoundFixtures[0].stage;
                  tournament.currentRound = 1; // Reset round for new stage
                }
              }
            }
          } else {
            // Check if all group stage matches are completed to potentially advance to knockout
            const groupFixtures = tournament.fixtures.filter(f => f.stage === 'group');
            const allGroupCompleted = groupFixtures.every(f => f.status === 'completed');
            
            if (allGroupCompleted && tournament.settings.includeKnockoutStage) {
              // Auto-advance to knockout stage
              get().advanceToKnockoutStage(tournament.id);
            }
          }

          // Check if tournament complete
          const allCompleted = tournament.fixtures.every(f => f.status === 'completed');
          if (allCompleted) {
            tournament.status = 'completed';
            tournament.endDate = new Date();

            // Determine winner
            if (tournament.format === 'league' && !tournament.settings.includeKnockoutStage) {
              // If league format without knockout, winner is top of standings
              const winner = [...tournament.teams].sort((a, b) => b.points - a.points)[0];
              tournament.winner = winner.teamName;
            } else {
              // For knockout or league+knockout, the winner is from the final match
              const finalMatch = tournament.fixtures.find(
                f => f.stage === 'final' && f.status === 'completed'
              );
              if (finalMatch && finalMatch.winnerId) {
                const winnerTeam = tournament.teams.find(t => t.id === finalMatch.winnerId);
                if (winnerTeam) {
                  tournament.winner = winnerTeam.teamName;
                }
              }
            }
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

        getTournamentFixturesByStage: (tournamentId, stage) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          return tournament?.fixtures.filter(f => f.stage === stage) || [];
        },

        getTournamentTable: (tournamentId, tableId) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          if (!tournament) return [];
          
          const teams = tournament.teams.filter(team => team.tableId === tableId);
          
          // Sort by standings criteria
          return [...teams].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
          });
        },

        getTournamentStandings: (tournamentId) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          if (!tournament || tournament.format !== 'league') return [];

          return [...tournament.teams].sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
            return b.goalsFor - a.goalsFor;
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