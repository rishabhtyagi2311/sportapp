// /store/knockoutTournamentStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// Knockout Tournament Types
export type TournamentFormat = 'knockout';
export type TournamentStage = 'round_of_16' | 'quarter_final' | 'semi_final' | 'final';

// Tournament Match Event (same as league)
export interface KnockoutMatchEvent {
  id: string;
  teamId: string;
  eventType: 'goal' | 'card' | 'substitution' | 'foul' | 'corner' | 'offside';
  eventSubType?: string;
  playerId: string;
  playerName: string;
  assistPlayerId?: string;
  assistPlayerName?: string;
  minute: number;
  seconds: number;
  isExtraTime: boolean;
  description?: string;
  timestamp: Date;
}

// Active Knockout Tournament Match
export interface ActiveKnockoutMatch {
  fixtureId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  homeTeamPlayers: string[];
  awayTeamPlayers: string[];
  homeCaptain?: string;
  awayCaptain?: string;
  referees: string[];
  events: KnockoutMatchEvent[];
  homeScore: number;
  awayScore: number;
  startTime: Date;
  currentMinute: number;
  status: 'setup' | 'playing' | 'finished';
  // Extra time & penalties for knockout
  extraTimeScore?: {
    homeScore: number;
    awayScore: number;
  };
  penaltyShootout?: {
    homeShootoutScore: number;
    awayShootoutScore: number;
    isCompleted: boolean;
  };
}

// Knockout Tournament Team
export interface KnockoutTournamentTeam {
  id: string;
  teamName: string;
  teamId: string; // Reference to original team in football store
  logoUrl?: string;
  seedPosition?: number; // Seeding for brackets (1, 2, 3, etc.)
  status: 'active' | 'eliminated' | 'winner';
  matchesPlayed: number;
  goalsFor: number;
  goalsAgainst: number;
}

// Knockout Tournament Fixture/Match
export interface KnockoutFixture {
  id: string;
  stage: TournamentStage;
  matchNumber: number;
  roundNumber: number; // 1 for round of 16, 2 for quarter-final, etc.
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;
  scheduledDate?: Date;
  status: 'upcoming' | 'in_progress' | 'completed';
  homeScore?: number;
  awayScore?: number;
  extraTimeScore?: {
    homeScore: number;
    awayScore: number;
  };
  penaltyShootout?: {
    homeShootoutScore: number;
    awayShootoutScore: number;
  };
  winner?: string; // Winning team ID
  winnerName?: string; // Winning team name
  matchData?: any; // Full match details stored after completion
  venue?: string;
  // Links to next round fixture
  nextFixtureId?: string; // Fixture this winner advances to
}

// Knockout Tournament Settings
export interface KnockoutTournamentSettings {
  venue: string;
  numberOfPlayers: number;
  numberOfSubstitutes: number;
  numberOfReferees: number;
  matchDuration: number; // 90 minutes
  format: TournamentFormat;
  allowExtraTime?: boolean; // default true
  allowPenaltyShootout?: boolean; // default true (for ties in knockout)
}

// Knockout Tournament
export interface KnockoutTournament {
  id: string;
  name: string;
  description?: string;
  format: TournamentFormat;
  settings: KnockoutTournamentSettings;
  teams: KnockoutTournamentTeam[];
  fixtures: KnockoutFixture[];
  currentStage: TournamentStage;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  totalTeams: number; // Must be power of 2 (8, 16, 32)
  currentRound: number; // 1, 2, 3, 4 (based on totalTeams)
  totalRounds: number; // Calculated: log2(totalTeams)
  startDate?: Date;
  endDate?: Date;
  winner?: string; // Winning team name
  winnerTeamId?: string; // Winning team ID
  bracket?: KnockoutBracket; // Visual bracket structure
  createdAt: Date;
  updatedAt: Date;
}

// Bracket structure for visualization
export interface KnockoutBracket {
  round1Matches: string[]; // Fixture IDs
  round2Matches: string[];
  round3Matches: string[];
  finalMatch?: string;
}

// Tournament Creation Draft
export interface KnockoutTournamentCreationDraft {
  name: string;
  description?: string;
  format: TournamentFormat;
  teamCount: number; // Must be power of 2
  settings: Partial<KnockoutTournamentSettings>;
  selectedTeamIds: string[];
  seedingStrategy?: 'random' | 'seeded'; // How to arrange bracket
  customSeeding?: Record<string, number>; // teamId -> seed position
}

interface KnockoutTournamentState {
  tournaments: KnockoutTournament[];
  activeTournament: KnockoutTournament | null;
  creationDraft: KnockoutTournamentCreationDraft | null;
  activeKnockoutMatch: ActiveKnockoutMatch | null;

  // Creation Flow
  startKnockoutTournamentCreation: (name: string) => void;
  updateKnockoutCreationDraft: (updates: Partial<KnockoutTournamentCreationDraft>) => void;
  addTeamToKnockoutDraft: (teamId: string) => void;
  removeTeamFromKnockoutDraft: (teamId: string) => void;
  setSeedPosition: (teamId: string, seedPosition: number) => void;
  setKnockoutTournamentSettings: (settings: KnockoutTournamentSettings) => void;
  createKnockoutTournament: () => string | null;
  cancelKnockoutTournamentCreation: () => void;

  // Tournament Management
  generateKnockoutBracket: (tournamentId: string) => void;
  startKnockoutTournament: (tournamentId: string) => void;

  // Match Flow
  initializeKnockoutMatch: (tournamentId: string, fixtureId: string) => {
    homeTeamId: string;
    awayTeamId: string;
    homeTeamName: string;
    awayTeamName: string;
  } | null;
  setKnockoutMatchPlayers: (homePlayerIds: string[], awayPlayerIds: string[]) => void;
  setKnockoutMatchCaptains: (homeCaptain: string, awayCaptain: string) => void;
  setKnockoutMatchReferees: (referees: string[]) => void;
  startKnockoutMatchScoring: () => void;
  addKnockoutMatchEvent: (event: Omit<KnockoutMatchEvent, 'id' | 'timestamp'>) => void;
  startExtraTime: () => void;
  startPenaltyShootout: () => void;
  addPenaltyGoal: (teamId: string) => void;
  endKnockoutMatch: () => void;
  cancelKnockoutMatch: () => void;

  // Queries
  getKnockoutTournament: (tournamentId: string) => KnockoutTournament | null;
  getKnockoutFixtures: (tournamentId: string) => KnockoutFixture[];
  getFixturesByStage: (tournamentId: string, stage: TournamentStage) => KnockoutFixture[];
  getUpcomingKnockoutFixtures: (tournamentId: string) => KnockoutFixture[];
  getCompletedKnockoutFixtures: (tournamentId: string) => KnockoutFixture[];
  getKnockoutFixture: (tournamentId: string, fixtureId: string) => KnockoutFixture | null;
  getTeamStatus: (tournamentId: string, teamId: string) => KnockoutTournamentTeam | null;

  // Management
  deleteKnockoutTournament: (tournamentId: string) => void;
  clearAllKnockoutTournaments: () => void;
}

// Validation: Check if number is power of 2
const isPowerOfTwo = (n: number): boolean => {
  return n > 0 && (n & (n - 1)) === 0;
};

// Calculate total rounds needed
const calculateTotalRounds = (teamCount: number): number => {
  return Math.log2(teamCount);
};

// Get stage from round number
const getStageFromRound = (round: number, totalRounds: number): TournamentStage => {
  const remaining = totalRounds - round + 1;
  if (remaining === 1) return 'round_of_16';
  if (remaining === 2) return 'quarter_final';
  if (remaining === 3) return 'semi_final';
  if (remaining === 4) return 'final';
  return 'round_of_16';
};

// Generate knockout bracket fixtures
const generateKnockoutFixtures = (tournament: KnockoutTournament): KnockoutFixture[] => {
  const fixtures: KnockoutFixture[] = [];
  const teams = [...tournament.teams];
  let matchNumber = 1;
  let currentRound = 1;

  // First round: pair up all teams
  const roundMatches: KnockoutFixture[] = [];
  for (let i = 0; i < teams.length; i += 2) {
    const homeTeam = teams[i];
    const awayTeam = teams[i + 1];

    if (!homeTeam || !awayTeam) continue;

    const totalRounds = tournament.totalRounds;
    const stage = getStageFromRound(currentRound, totalRounds);

    roundMatches.push({
      id: `knockout_fixture_${Date.now()}_${matchNumber}`,
      stage,
      matchNumber,
      roundNumber: currentRound,
      homeTeamId: homeTeam.id,
      awayTeamId: awayTeam.id,
      homeTeamName: homeTeam.teamName,
      awayTeamName: awayTeam.teamName,
      status: 'upcoming',
    });
    matchNumber++;
  }

  fixtures.push(...roundMatches);

  // Subsequent rounds (placeholders for future winners)
  let teamsInNextRound = Math.ceil(teams.length / 2);
  currentRound++;

  while (teamsInNextRound > 1) {
    for (let i = 0; i < teamsInNextRound; i += 2) {
      const totalRounds = tournament.totalRounds;
      const stage = getStageFromRound(currentRound, totalRounds);

      fixtures.push({
        id: `knockout_fixture_${Date.now()}_${matchNumber}`,
        stage,
        matchNumber,
        roundNumber: currentRound,
        homeTeamId: '', // Will be filled by winners
        awayTeamId: '', // Will be filled by winners
        homeTeamName: 'TBD',
        awayTeamName: 'TBD',
        status: 'upcoming',
      });
      matchNumber++;
    }
    teamsInNextRound = Math.ceil(teamsInNextRound / 2);
    currentRound++;
  }

  return fixtures;
};

// Link fixture winners to next round
const linkFixtureWinners = (
  fixtures: KnockoutFixture[],
  completedFixtureId: string,
  winner: { teamId: string; teamName: string }
): KnockoutFixture[] => {
  const updatedFixtures = [...fixtures];
  const completedFixture = updatedFixtures.find(f => f.id === completedFixtureId);

  if (!completedFixture) return updatedFixtures;

  const currentRound = completedFixture.roundNumber;
  const matchNumber = completedFixture.matchNumber;

  // Find corresponding slot in next round
  // Match 1,2 → Match 1 (position 0,1 → 0)
  // Match 3,4 → Match 2 (position 2,3 → 1)
  const nextRoundMatchIndex = Math.floor((matchNumber - 1) / 2);
  const isHomeTeam = (matchNumber - 1) % 2 === 0;

  const nextRoundFixtures = updatedFixtures.filter(f => f.roundNumber === currentRound + 1);
  if (nextRoundFixtures.length === 0) return updatedFixtures;

  const nextFixture = nextRoundFixtures[nextRoundMatchIndex];
  if (!nextFixture) return updatedFixtures;

  if (isHomeTeam) {
    nextFixture.homeTeamId = winner.teamId;
    nextFixture.homeTeamName = winner.teamName;
  } else {
    nextFixture.awayTeamId = winner.teamId;
    nextFixture.awayTeamName = winner.teamName;
  }

  return updatedFixtures;
};

export const useKnockoutTournamentStore = create<KnockoutTournamentState>()(
  devtools(
    persist(
      immer((set, get) => ({
        tournaments: [],
        activeTournament: null,
        creationDraft: null,
        activeKnockoutMatch: null,

        startKnockoutTournamentCreation: (name) =>
          set((state) => {
            state.creationDraft = {
              name,
              format: 'knockout',
              teamCount: 8,
              settings: {
                venue: '',
                numberOfPlayers: 11,
                numberOfSubstitutes: 5,
                numberOfReferees: 1,
                matchDuration: 90,
                format: 'knockout',
                allowExtraTime: true,
                allowPenaltyShootout: true,
              },
              selectedTeamIds: [],
              seedingStrategy: 'random',
            };
          }),

        updateKnockoutCreationDraft: (updates) =>
          set((state) => {
            if (state.creationDraft) {
              Object.assign(state.creationDraft, updates);
            }
          }),

        addTeamToKnockoutDraft: (teamId) =>
          set((state) => {
            if (state.creationDraft && !state.creationDraft.selectedTeamIds.includes(teamId)) {
              state.creationDraft.selectedTeamIds.push(teamId);
            }
          }),

        removeTeamFromKnockoutDraft: (teamId) =>
          set((state) => {
            if (state.creationDraft) {
              state.creationDraft.selectedTeamIds = state.creationDraft.selectedTeamIds.filter(
                (id) => id !== teamId
              );
              if (state.creationDraft.customSeeding) {
                delete state.creationDraft.customSeeding[teamId];
              }
            }
          }),

        setSeedPosition: (teamId, seedPosition) =>
          set((state) => {
            if (state.creationDraft) {
              if (!state.creationDraft.customSeeding) {
                state.creationDraft.customSeeding = {};
              }
              state.creationDraft.customSeeding[teamId] = seedPosition;
            }
          }),

        setKnockoutTournamentSettings: (settings) =>
          set((state) => {
            if (state.creationDraft) {
              state.creationDraft.settings = settings;
            }
          }),

        createKnockoutTournament: () => {
          const state = get();
          const draft = state.creationDraft;

          if (!draft) return null;

          // Validate team count is power of 2
          if (!isPowerOfTwo(draft.teamCount)) {
            console.error(`Team count must be power of 2 (2, 4, 8, 16, 32)`);
            return null;
          }

          if (draft.selectedTeamIds.length < draft.teamCount) {
            console.error(`Not enough teams selected: ${draft.selectedTeamIds.length}/${draft.teamCount}`);
            return null;
          }

          const footballStore = useFootballStore.getState();
          const actualTeams = draft.selectedTeamIds
            .slice(0, draft.teamCount)
            .map((teamId) => footballStore.getTeamById(teamId))
            .filter((team) => team !== undefined) as any[];

          if (actualTeams.length < 2) {
            console.error('Could not find all selected teams in football store');
            return null;
          }

          const tournamentId = `knockout_tournament_${Date.now()}`;
          const totalRounds = calculateTotalRounds(draft.teamCount);

          // Create tournament teams with seeding
          const teams: KnockoutTournamentTeam[] = actualTeams.map((team: any, index: number) => ({
            id: `knockout_team_${team.id}_${Date.now()}_${index}`,
            teamId: team.id,
            teamName: team.teamName,
            logoUrl: team.logoUrl,
            seedPosition: draft.customSeeding?.[team.id] ?? index + 1,
            status: 'active',
            matchesPlayed: 0,
            goalsFor: 0,
            goalsAgainst: 0,
          }));

          // Sort by seeding to arrange bracket
          if (draft.seedingStrategy === 'seeded') {
            teams.sort((a, b) => (a.seedPosition || 0) - (b.seedPosition || 0));
          }

          const tournament: KnockoutTournament = {
            id: tournamentId,
            name: draft.name,
            description: draft.description,
            format: 'knockout',
            settings: {
              ...draft.settings,
              format: 'knockout',
              allowExtraTime: draft.settings?.allowExtraTime ?? true,
              allowPenaltyShootout: draft.settings?.allowPenaltyShootout ?? true,
            } as KnockoutTournamentSettings,
            teams,
            fixtures: [],
            currentStage: 'round_of_16',
            status: 'draft',
            totalTeams: draft.teamCount,
            currentRound: 1,
            totalRounds,
            bracket: {
              round1Matches: [],
              round2Matches: [],
              round3Matches: [],
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => {
            state.tournaments.push(tournament);
            state.creationDraft = null;
          });

          get().generateKnockoutBracket(tournamentId);
          return tournamentId;
        },

        cancelKnockoutTournamentCreation: () =>
          set((state) => {
            state.creationDraft = null;
          }),

        generateKnockoutBracket: (tournamentId) =>
          set((state) => {
            const tournament = state.tournaments.find((t) => t.id === tournamentId);
            if (!tournament) return;

            const fixtures = generateKnockoutFixtures(tournament);
            tournament.fixtures = fixtures;

            // Organize bracket structure
            if (tournament.bracket) {
              tournament.bracket.round1Matches = fixtures
                .filter((f) => f.roundNumber === 1)
                .map((f) => f.id);
              tournament.bracket.round2Matches = fixtures
                .filter((f) => f.roundNumber === 2)
                .map((f) => f.id);
              tournament.bracket.round3Matches = fixtures
                .filter((f) => f.roundNumber === 3)
                .map((f) => f.id);
              tournament.bracket.finalMatch = fixtures.find((f) => f.roundNumber === tournament.totalRounds)?.id;
            }

            tournament.updatedAt = new Date();
          }),

        startKnockoutTournament: (tournamentId) =>
          set((state) => {
            const tournament = state.tournaments.find((t) => t.id === tournamentId);
            if (tournament) {
              tournament.status = 'active';
              tournament.startDate = new Date();
              tournament.updatedAt = new Date();
            }
          }),

        initializeKnockoutMatch: (tournamentId, fixtureId) => {
          const state = get();
          const tournament = state.tournaments.find((t) => t.id === tournamentId);
          if (!tournament) return null;

          const fixture = tournament.fixtures.find((f) => f.id === fixtureId);
          if (!fixture || !fixture.homeTeamId || !fixture.awayTeamId) return null;

          set((state) => {
            state.activeKnockoutMatch = {
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

        setKnockoutMatchPlayers: (homePlayerIds, awayPlayerIds) =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.homeTeamPlayers = homePlayerIds;
              state.activeKnockoutMatch.awayTeamPlayers = awayPlayerIds;
            }
          }),

        setKnockoutMatchCaptains: (homeCaptain, awayCaptain) =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.homeCaptain = homeCaptain;
              state.activeKnockoutMatch.awayCaptain = awayCaptain;
            }
          }),

        setKnockoutMatchReferees: (referees) =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.referees = referees;
            }
          }),

        startKnockoutMatchScoring: () =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.status = 'playing';
              state.activeKnockoutMatch.startTime = new Date();
            }
          }),

        addKnockoutMatchEvent: (eventData) =>
          set((state) => {
            if (!state.activeKnockoutMatch) return;

            const newEvent: KnockoutMatchEvent = {
              ...eventData,
              id: `event_${Date.now()}`,
              timestamp: new Date(),
            };

            state.activeKnockoutMatch.events.push(newEvent);
            state.activeKnockoutMatch.events.sort((a, b) => a.minute - b.minute);

            // Handle goals
            if (newEvent.eventType === 'goal') {
              const isHomeTeam = newEvent.teamId === state.activeKnockoutMatch.homeTeamId;
              const isOwnGoal = newEvent.eventSubType === 'own_goal';

              if (isOwnGoal) {
                if (isHomeTeam) {
                  state.activeKnockoutMatch.awayScore += 1;
                } else {
                  state.activeKnockoutMatch.homeScore += 1;
                }
              } else {
                if (isHomeTeam) {
                  state.activeKnockoutMatch.homeScore += 1;
                } else {
                  state.activeKnockoutMatch.awayScore += 1;
                }
              }
            }
          }),

        startExtraTime: () =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.extraTimeScore = {
                homeScore: state.activeKnockoutMatch.homeScore,
                awayScore: state.activeKnockoutMatch.awayScore,
              };
              state.activeKnockoutMatch.currentMinute = 90;
            }
          }),

        startPenaltyShootout: () =>
          set((state) => {
            if (state.activeKnockoutMatch) {
              state.activeKnockoutMatch.penaltyShootout = {
                homeShootoutScore: 0,
                awayShootoutScore: 0,
                isCompleted: false,
              };
            }
          }),

        addPenaltyGoal: (teamId) =>
          set((state) => {
            if (!state.activeKnockoutMatch || !state.activeKnockoutMatch.penaltyShootout) return;

            const isHome = teamId === state.activeKnockoutMatch.homeTeamId;
            if (isHome) {
              state.activeKnockoutMatch.penaltyShootout.homeShootoutScore += 1;
            } else {
              state.activeKnockoutMatch.penaltyShootout.awayShootoutScore += 1;
            }
          }),

        endKnockoutMatch: () =>
          set((state) => {
            if (!state.activeKnockoutMatch) return;

            const match = state.activeKnockoutMatch;
            const tournament = state.tournaments.find((t) => t.id === match.tournamentId);
            if (!tournament) return;

            const fixture = tournament.fixtures.find((f) => f.id === match.fixtureId);
            if (!fixture) return;

            // Determine winner
            let winner: { teamId: string; teamName: string } | null = null;

            if (match.homeScore > match.awayScore) {
              winner = { teamId: match.homeTeamId, teamName: match.homeTeamName };
            } else if (match.awayScore > match.homeScore) {
              winner = { teamId: match.awayTeamId, teamName: match.awayTeamName };
            } else if (match.extraTimeScore) {
              // Extra time check
              if (match.extraTimeScore.homeScore > match.extraTimeScore.awayScore) {
                winner = { teamId: match.homeTeamId, teamName: match.homeTeamName };
              } else if (match.extraTimeScore.awayScore > match.extraTimeScore.homeScore) {
                winner = { teamId: match.awayTeamId, teamName: match.awayTeamName };
              }
            }

            // Penalty shootout check
            if (!winner && match.penaltyShootout) {
              if (match.penaltyShootout.homeShootoutScore > match.penaltyShootout.awayShootoutScore) {
                winner = { teamId: match.homeTeamId, teamName: match.homeTeamName };
              } else {
                winner = { teamId: match.awayTeamId, teamName: match.awayTeamName };
              }
            }

            // Update fixture
            fixture.status = 'completed';
            fixture.homeScore = match.homeScore;
            fixture.awayScore = match.awayScore;
            if (match.extraTimeScore) {
              fixture.extraTimeScore = match.extraTimeScore;
            }
            if (match.penaltyShootout) {
              fixture.penaltyShootout = match.penaltyShootout;
            }
            fixture.matchData = { ...match };

            // Update loser team status
            const homeTeam = tournament.teams.find((t) => t.id === match.homeTeamId);
            const awayTeam = tournament.teams.find((t) => t.id === match.awayTeamId);

            if (homeTeam) {
              homeTeam.matchesPlayed += 1;
              homeTeam.goalsFor += match.homeScore;
              homeTeam.goalsAgainst += match.awayScore;
            }
            if (awayTeam) {
              awayTeam.matchesPlayed += 1;
              awayTeam.goalsFor += match.awayScore;
              awayTeam.goalsAgainst += match.homeScore;
            }

            if (winner) {
              fixture.winner = winner.teamId;
              fixture.winnerName = winner.teamName;

              // Link to next fixture
              tournament.fixtures = linkFixtureWinners(tournament.fixtures, fixture.id, winner);

              // Update team status
              const winnerTeam = tournament.teams.find((t) => t.id === winner.teamId);
              if (winnerTeam) {
                winnerTeam.status = 'active';
              }

              const loserTeamId = match.homeTeamId === winner.teamId ? match.awayTeamId : match.homeTeamId;
              const loserTeam = tournament.teams.find((t) => t.id === loserTeamId);
              if (loserTeam) {
                loserTeam.status = 'eliminated';
              }

              // Check if tournament finished
              const completedFixtures = tournament.fixtures.filter((f) => f.status === 'completed');
              const totalFixtures = tournament.fixtures.length;

              if (completedFixtures.length === totalFixtures) {
                tournament.status = 'completed';
                tournament.endDate = new Date();
                tournament.winner = winner.teamName;
                tournament.winnerTeamId = winner.teamId;
              } else {
                // Update current stage based on remaining matches
                const upcomingFixtures = tournament.fixtures.filter((f) => f.status === 'upcoming');
                if (upcomingFixtures.length > 0) {
                  tournament.currentStage = upcomingFixtures[0].stage;
                  tournament.currentRound = upcomingFixtures[0].roundNumber;
                }
              }
            }

            tournament.updatedAt = new Date();
            state.activeKnockoutMatch = null;
          }),

        cancelKnockoutMatch: () =>
          set((state) => {
            state.activeKnockoutMatch = null;
          }),

        // Queries
        getKnockoutTournament: (tournamentId) => {
          return get().tournaments.find((t) => t.id === tournamentId) || null;
        },

        getKnockoutFixtures: (tournamentId) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.fixtures || [];
        },

        getFixturesByStage: (tournamentId, stage) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.fixtures.filter((f) => f.stage === stage) || [];
        },

        getUpcomingKnockoutFixtures: (tournamentId) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.fixtures.filter((f) => f.status === 'upcoming') || [];
        },

        getCompletedKnockoutFixtures: (tournamentId) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.fixtures.filter((f) => f.status === 'completed') || [];
        },

        getKnockoutFixture: (tournamentId, fixtureId) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.fixtures.find((f) => f.id === fixtureId) || null;
        },

        getTeamStatus: (tournamentId, teamId) => {
          const tournament = get().tournaments.find((t) => t.id === tournamentId);
          return tournament?.teams.find((t) => t.id === teamId) || null;
        },

        deleteKnockoutTournament: (tournamentId) =>
          set((state) => {
            if (state.activeKnockoutMatch?.tournamentId === tournamentId) {
              state.activeKnockoutMatch = null;
            }
            if (state.activeTournament?.id === tournamentId) {
              state.activeTournament = null;
            }
            state.tournaments = state.tournaments.filter((t) => t.id !== tournamentId);
          }),

        clearAllKnockoutTournaments: () =>
          set((state) => {
            state.tournaments = [];
            state.activeTournament = null;
            state.activeKnockoutMatch = null;
          }),
      })),
      {
        name: 'knockout-tournament-storage',
      }
    ),
    {
      name: 'knockout-tournament-store',
    }
  )
);