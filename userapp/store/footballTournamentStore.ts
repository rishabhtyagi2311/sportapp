// stores/tournamentStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// Tournament Types
export type TournamentFormat = 'league' | 'knockout';

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
}

export interface TournamentFixture {
  id: string;
  round: number;
  roundName?: string; // E.g., "Quarter Finals", "Semi Finals", "Final"
  matchNumber: number;
  homeTeamId: string | null; // null for TBD teams in knockout
  awayTeamId: string | null; // null for TBD teams in knockout
  homeTeamName: string;
  awayTeamName: string;
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
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  settings: TournamentSettings;
  teams: TournamentTeam[];
  fixtures: TournamentFixture[];
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
  settings: Partial<TournamentSettings>;
  selectedTeamIds: string[];
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
  setTournamentSettings: (settings: TournamentSettings) => void;
  createTournament: () => string | null;
  cancelTournamentCreation: () => void;

  // Tournament Management
  generateFixtures: (tournamentId: string) => void;
  startTournament: (tournamentId: string) => void;
  generateNextKnockoutRound: (tournamentId: string) => void;

  // Tournament Match Flow (Separate System)
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
  getTournamentStandings: (tournamentId: string) => TournamentTeam[];
  getUpcomingFixtures: (tournamentId: string) => TournamentFixture[];
  getCompletedFixtures: (tournamentId: string) => TournamentFixture[];
  getFixturesByRound: (tournamentId: string, round: number) => TournamentFixture[];

  // Management
  deleteTournament: (tournamentId: string) => void;
  clearAllTournaments: () => void;
}

// Helper function to get knockout round name
const getKnockoutRoundName = (round: number, totalRounds: number): string => {
  const roundsFromEnd = totalRounds - round + 1;

  if (roundsFromEnd === 1) return 'Final';
  if (roundsFromEnd === 2) return 'Semi Finals';
  if (roundsFromEnd === 3) return 'Quarter Finals';
  if (roundsFromEnd === 4) return 'Round of 16';
  return `Round ${round}`;
};

// Helper Functions for League Format - DOUBLE Round Robin (Home & Away)
const generateLeagueFixtures = (teams: TournamentTeam[]): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const numTeams = teams.length;
  if (numTeams < 2) return fixtures;

  let matchNumber = 1;
  let currentRound = 1;

  // Double round-robin: each team plays every other team TWICE (home and away)
  // First leg: all combinations
  for (let i = 0; i < numTeams; i++) {
    for (let j = i + 1; j < numTeams; j++) {
      fixtures.push({
        id: `fixture_${Date.now()}_${matchNumber}`,
        round: currentRound,
        roundName: `Matchday ${currentRound}`,
        matchNumber,
        homeTeamId: teams[i].id,
        awayTeamId: teams[j].id,
        homeTeamName: teams[i].teamName,
        awayTeamName: teams[j].teamName,
        status: 'upcoming',
      });
      matchNumber++;

      // Increment round after every set of matches
      if (matchNumber % Math.ceil(numTeams / 2) === 1 && matchNumber > 1) {
        currentRound++;
      }
    }
  }

  // Second leg: reverse fixtures (away teams become home teams)
  const firstLegCount = fixtures.length;
  for (let k = 0; k < firstLegCount; k++) {
    const firstLegFixture = fixtures[k];
    fixtures.push({
      id: `fixture_${Date.now()}_${matchNumber}`,
      round: currentRound,
      roundName: `Matchday ${currentRound}`,
      matchNumber,
      homeTeamId: firstLegFixture.awayTeamId,
      awayTeamId: firstLegFixture.homeTeamId,
      homeTeamName: firstLegFixture.awayTeamName,
      awayTeamName: firstLegFixture.homeTeamName,
      status: 'upcoming',
    });
    matchNumber++;

    if (matchNumber % Math.ceil(numTeams / 2) === 1 && matchNumber > firstLegCount + 1) {
      currentRound++;
    }
  }

  return fixtures;
};

// Helper Functions for Knockout Format
const generateKnockoutFixtures = (teams: TournamentTeam[]): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const numTeams = teams.length;

  // Calculate total number of rounds needed
  const totalRounds = Math.ceil(Math.log2(numTeams));

  let matchNumber = 1;

  // Generate first round only
  for (let i = 0; i < numTeams; i += 2) {
    if (i + 1 < numTeams) {
      fixtures.push({
        id: `fixture_${Date.now()}_${matchNumber}`,
        round: 1,
        roundName: getKnockoutRoundName(1, totalRounds),
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
        id: `fixture_${Date.now()}_${matchNumber}`,
        round: 1,
        roundName: getKnockoutRoundName(1, totalRounds),
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

// Generate next round fixtures for knockout tournaments
const generateNextKnockoutRoundFixtures = (
  tournament: Tournament,
  currentRound: number
): TournamentFixture[] => {
  const fixtures: TournamentFixture[] = [];
  const previousRoundFixtures = tournament.fixtures.filter(f => f.round === currentRound);

  // Get winners from previous round
  const winners = previousRoundFixtures
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

  const nextRound = currentRound + 1;
  let matchNumber = tournament.fixtures.length + 1;

  // Pair up winners for next round
  for (let i = 0; i < winners.length; i += 2) {
    if (i + 1 < winners.length) {
      fixtures.push({
        id: `fixture_${Date.now()}_${matchNumber}`,
        round: nextRound,
        roundName: getKnockoutRoundName(nextRound, tournament.totalRounds),
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
            settings: {
              venue: '',
              numberOfPlayers: 11,
              numberOfSubstitutes: 5,
              numberOfReferees: 1,
              matchDuration: 90,
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

        setTournamentSettings: (settings) => set((state) => {
          if (state.creationDraft) {
            state.creationDraft.settings = settings;
          }
        }),

        createTournament: () => {
          const state = get();
          const draft = state.creationDraft;

          if (!draft || draft.selectedTeamIds.length < 2) return null;

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

          // Create tournament teams with actual team data
          const teams: TournamentTeam[] = actualTeams.map((team, index) => ({
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
          }));

          // Calculate total rounds based on format
          let totalRounds: number;
          if (draft.format === 'league') {
            // Double round-robin: n teams, each plays n-1 others twice
            // Total matches = n * (n-1), divided into rounds
            totalRounds = (teams.length - 1) * 2;
          } else {
            // Knockout: rounds = log2(teams)
            totalRounds = Math.ceil(Math.log2(teams.length));
          }

          const tournament: Tournament = {
            id: tournamentId,
            name: draft.name,
            description: draft.description,
            format: draft.format,
            settings: draft.settings as TournamentSettings,
            teams,
            fixtures: [],
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

          const fixtures = tournament.format === 'league'
            ? generateLeagueFixtures(tournament.teams)
            : generateKnockoutFixtures(tournament.teams);

          tournament.fixtures = fixtures;
          tournament.currentRound = 1;
          tournament.updatedAt = new Date();
        }),

        generateNextKnockoutRound: (tournamentId) => set((state) => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament || tournament.format !== 'knockout') return;

          const currentRoundFixtures = tournament.fixtures.filter(
            f => f.round === tournament.currentRound
          );

          // Check if all current round matches are completed
          const allCompleted = currentRoundFixtures.every(f => f.status === 'completed');
          if (!allCompleted) return;

          // Check if we've reached the final
          if (tournament.currentRound >= tournament.totalRounds) return;

          // Generate next round fixtures
          const nextRoundFixtures = generateNextKnockoutRoundFixtures(
            tournament,
            tournament.currentRound
          );

          if (nextRoundFixtures.length > 0) {
            tournament.fixtures.push(...nextRoundFixtures);
            tournament.currentRound += 1;
            tournament.updatedAt = new Date();
          }
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

          // Determine winner for knockout
          if (tournament.format === 'knockout') {
            if (match.homeScore > match.awayScore) {
              fixture.winnerId = match.homeTeamId;
            } else if (match.awayScore > match.homeScore) {
              fixture.winnerId = match.awayTeamId;
            } else {
              // In case of draw, home team wins (or implement penalty shootout)
              fixture.winnerId = match.homeTeamId;
            }

            // Mark losing team as eliminated
            const loserId = fixture.winnerId === match.homeTeamId ? match.awayTeamId : match.homeTeamId;
            const loserTeam = tournament.teams.find(t => t.id === loserId);
            if (loserTeam) {
              loserTeam.isEliminated = true;
            }
          }

          // Update standings for league
          if (tournament.format === 'league') {
            tournament.teams = updateStandings(
              tournament.teams,
              match.homeTeamId,
              match.awayTeamId,
              match.homeScore,
              match.awayScore
            );
          }

          tournament.updatedAt = new Date();

          // Check round completion and generate next knockout round
          if (tournament.format === 'knockout') {
            const currentRoundFixtures = tournament.fixtures.filter(
              f => f.round === tournament.currentRound
            );
            const allRoundCompleted = currentRoundFixtures.every(f => f.status === 'completed');

            if (allRoundCompleted && tournament.currentRound < tournament.totalRounds) {
              // Generate next round
              get().generateNextKnockoutRound(tournament.id);
            }
          }

          // Check if tournament complete
          const allCompleted = tournament.fixtures.every(f => f.status === 'completed');
          if (allCompleted) {
            tournament.status = 'completed';
            tournament.endDate = new Date();

            if (tournament.format === 'league') {
              const winner = [...tournament.teams].sort((a, b) => b.points - a.points)[0];
              tournament.winner = winner.teamName;
            } else {
              // For knockout, the winner of the final is the tournament winner
              const finalMatch = tournament.fixtures.find(
                f => f.round === tournament.totalRounds && f.status === 'completed'
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

        getTournament: (tournamentId) => {
          return get().tournaments.find(t => t.id === tournamentId) || null;
        },

        getTournamentFixtures: (tournamentId) => {
          const tournament = get().tournaments.find(t => t.id === tournamentId);
          return tournament?.fixtures || [];
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
            console.log('🧹 Cleared active tournament match for deleted tournament');
          }

          if (state.activeTournament?.id === tournamentId) {
            state.activeTournament = null;
            console.log('🧹 Cleared active tournament reference');
          }

          
          state.tournaments = state.tournaments.filter(t => t.id !== tournamentId);

          
        }),

        clearAllTournaments: () => set((state) => {
          state.tournaments = [];
          state.activeTournament = null;
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