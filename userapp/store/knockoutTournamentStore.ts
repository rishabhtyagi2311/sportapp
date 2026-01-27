import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { useFootballStore } from './footballTeamStore';

// --- Types ---

export type KnockoutStage = 'round_of_16' | 'quarter_final' | 'semi_final' | 'final' | 'winner';

export interface KnockoutMatchEvent {
  id: string;
  teamId: string;
  eventType: 'goal' | 'card' | 'substitution' | 'foul' | 'corner' | 'offside' | 'penalty_shootout';
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

export interface ActiveKnockoutMatch {
  fixtureId: string;
  tournamentId: string;
  homeTeamId: string;
  awayTeamId: string;
  homeTeamName: string;
  awayTeamName: string;

  // Roster
  homeTeamPlayers: string[]; // Starter IDs
  awayTeamPlayers: string[]; // Starter IDs
  homeTeamSubstitutes: string[]; // Bench IDs
  awayTeamSubstitutes: string[]; // Bench IDs

  homeCaptain?: string;
  awayCaptain?: string;
  referees: string[];

  // Live State
  events: KnockoutMatchEvent[];
  homeScore: number;
  awayScore: number;
  startTime: Date;
  currentMinute: number;
  status: 'setup' | 'playing' | 'finished';

  // Knockout Specifics
  isExtraTime: boolean;
  extraTimeScore?: { home: number; away: number };
  penaltyShootout?: {
    homeScore: number;
    awayScore: number;
    history: { teamId: string; result: 'goal' | 'miss' }[];
    isCompleted: boolean;
  };
}

export interface KnockoutTeam {
  id: string; // Unique ID in tournament context
  teamId: string; // Reference to FootballStore team
  teamName: string;
  logoUrl?: string;
  seed?: number;
  status: 'active' | 'eliminated' | 'winner';
}

export interface KnockoutFixture {
  id: string;
  matchNumber: number;
  round: number; // 1 = Ro16, 2 = QF, etc.
  stage: KnockoutStage;

  homeTeamId?: string; // Can be null if TBD
  awayTeamId?: string; // Can be null if TBD
  homeTeamName: string; // "TBD" if null
  awayTeamName: string; // "TBD" if null

  homeScore?: number;
  awayScore?: number;

  // Tie-breakers
  extraTimeScore?: { home: number; away: number };
  penaltyScore?: { home: number; away: number };

  winnerId?: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  nextFixtureId?: string; // ID of the match the winner goes to

  matchEvents?: KnockoutMatchEvent[];
}

export interface KnockoutSettings {
  name: string;
  format: 'knockout';
  teamCount: 2 | 4 | 8 | 16 | 32;
  matchDuration: number;
  numberOfPlayers: number;
  numberOfSubstitutes: number;
  numberOfReferees: number;
  extraTime: boolean;
  // REMOVED: penalties: boolean; 
  venue?: string;
}

export interface KnockoutTournament {
  id: string;
  name: string;
  status: 'draft' | 'active' | 'completed';
  settings: KnockoutSettings;
  teams: KnockoutTeam[];
  fixtures: KnockoutFixture[];
  currentRound: number;
  totalRounds: number;
  winnerId?: string;
  createdAt: string;
}

// --- Store State ---

interface KnockoutState {
  tournaments: KnockoutTournament[];
  activeTournamentId: string | null;
  activeMatch: ActiveKnockoutMatch | null;

  // Draft State (for creation flow)
  draft: {
    name: string;
    teamCount: number;
    selectedTeamIds: string[];
    settings: Partial<KnockoutSettings>;
  } | null;

  // --- Actions ---

  // Creation
  startDraft: (name: string) => void;
  updateDraft: (updates: Partial<KnockoutState['draft']>) => void;
  addTeamToDraft: (teamId: string) => void;
  removeTeamFromDraft: (teamId: string) => void;
  createTournament: () => string | null;
  cancelDraft: () => void;

  // Management
  setActiveTournament: (id: string) => void;
  generateBracket: (tournamentId: string) => void;
  deleteKnockoutTournament: (id: string) => void;

  // Match Execution
  initializeMatch: (tournamentId: string, fixtureId: string) => void;
  updateMatchRoster: (homeStarters: string[], awayStarters: string[], homeSubs: string[], awaySubs: string[]) => void;
  setMatchCaptains: (homeCaptain: string, awayCaptain: string) => void;
  setMatchReferees: (referees: string[]) => void;
  startMatch: () => void;
  addEvent: (event: Omit<KnockoutMatchEvent, 'id' | 'timestamp'>) => void;
  endMatch: () => void;

  // Getters
  getTournament: (id: string) => KnockoutTournament | undefined;
  getFixture: (tournamentId: string, fixtureId: string) => KnockoutFixture | undefined;

  // NEW: UI Helper Getters
  getFixturesByRound: (tournamentId: string, round: number) => KnockoutFixture[];
  getTournamentProgress: (tournamentId: string) => number;
}

// --- Helpers ---

const calculateRounds = (teams: number) => Math.log2(teams);

const getStageName = (round: number, totalRounds: number): KnockoutStage => {
  const diff = totalRounds - round;
  if (diff === 0) return 'final';
  if (diff === 1) return 'semi_final';
  if (diff === 2) return 'quarter_final';
  return 'round_of_16';
};

// --- Store Implementation ---

export const useKnockoutStore = create<KnockoutState>()(
  devtools(
    persist(
      immer((set, get) => ({
        tournaments: [],
        activeTournamentId: null,
        activeMatch: null,
        draft: null,

        // 1. DRAFT ACTIONS
        startDraft: (name) => set(state => {
          state.draft = {
            name,
            teamCount: 8,
            selectedTeamIds: [],
            settings: {
              format: 'knockout',
              matchDuration: 90,
              extraTime: true,
              // REMOVED: penalties: true,
              numberOfPlayers: 11,
              numberOfSubstitutes: 7,
              numberOfReferees: 1
            }
          };
        }),

        updateDraft: (updates) => set(state => {
          if (state.draft) Object.assign(state.draft, updates);
        }),

        addTeamToDraft: (teamId) => set(state => {
          if (state.draft && !state.draft.selectedTeamIds.includes(teamId)) {
            if (state.draft.selectedTeamIds.length < state.draft.teamCount) {
              state.draft.selectedTeamIds.push(teamId);
            }
          }
        }),

        removeTeamFromDraft: (teamId) => set(state => {
          if (state.draft) {
            state.draft.selectedTeamIds = state.draft.selectedTeamIds.filter(id => id !== teamId);
          }
        }),

        cancelDraft: () => set(state => { state.draft = null; }),

        createTournament: () => {
          const { draft } = get();
          const footballStore = useFootballStore.getState();

          if (!draft || draft.selectedTeamIds.length !== draft.teamCount) return null;

          const tournamentId = `kt_${Date.now()}`;

          // Hydrate Teams
          const teams: KnockoutTeam[] = draft.selectedTeamIds.map((tid, idx) => {
            const teamData = footballStore.getTeamById(tid);
            return {
              id: `kt_team_${tid}_${idx}`,
              teamId: tid,
              teamName: teamData?.teamName || 'Unknown Team',
              logoUrl: teamData?.logoUrl,
              seed: idx + 1,
              status: 'active'
            };
          });

          const newTournament: KnockoutTournament = {
            id: tournamentId,
            name: draft.name,
            status: 'active',
            settings: {
              name: draft.name,
              format: 'knockout',
              teamCount: draft.teamCount as any,
              matchDuration: draft.settings.matchDuration || 90,
              extraTime: draft.settings.extraTime ?? true,
              // REMOVED: penalties assignment
              venue: draft.settings.venue,
              numberOfPlayers: draft.settings.numberOfPlayers || 11,
              numberOfSubstitutes: draft.settings.numberOfSubstitutes || 7,
              numberOfReferees: draft.settings.numberOfReferees || 1
            },
            teams,
            fixtures: [],
            currentRound: 1,
            totalRounds: calculateRounds(draft.teamCount),
            createdAt: new Date().toISOString()
          };

          set(state => {
            state.tournaments.push(newTournament);
            state.draft = null;
          });

          get().generateBracket(tournamentId);
          return tournamentId;
        },

        // 2. BRACKET GENERATION
        generateBracket: (tournamentId) => set(state => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          if (!tournament) return;

          const fixtures: KnockoutFixture[] = [];
          const totalRounds = tournament.totalRounds;
          let matchIdCounter = 1;

          // Round 1 (Populated with teams)
          for (let i = 0; i < tournament.teams.length; i += 2) {
            const home = tournament.teams[i];
            const away = tournament.teams[i + 1];

            fixtures.push({
              id: `kf_${matchIdCounter}`,
              matchNumber: matchIdCounter,
              round: 1,
              stage: getStageName(1, totalRounds),
              homeTeamId: home.teamId,
              awayTeamId: away.teamId,
              homeTeamName: home.teamName,
              awayTeamName: away.teamName,
              status: 'upcoming'
            });
            matchIdCounter++;
          }

          // Future Rounds
          let matchesInRound = tournament.teams.length / 2;
          for (let r = 2; r <= totalRounds; r++) {
            matchesInRound /= 2;
            for (let i = 0; i < matchesInRound; i++) {
              fixtures.push({
                id: `kf_${matchIdCounter}`,
                matchNumber: matchIdCounter,
                round: r,
                stage: getStageName(r, totalRounds),
                homeTeamName: 'TBD',
                awayTeamName: 'TBD',
                status: 'upcoming'
              });
              matchIdCounter++;
            }
          }
          tournament.fixtures = fixtures;
        }),

        setActiveTournament: (id) => set(state => { state.activeTournamentId = id; }),

        deleteKnockoutTournament: (id) => set(state => {
          state.tournaments = state.tournaments.filter(t => t.id !== id);
          if (state.activeTournamentId === id) state.activeTournamentId = null;
          if (state.activeMatch?.tournamentId === id) state.activeMatch = null;
        }),

        // 3. MATCH EXECUTION
        initializeMatch: (tournamentId, fixtureId) => set(state => {
          const tournament = state.tournaments.find(t => t.id === tournamentId);
          const fixture = tournament?.fixtures.find(f => f.id === fixtureId);

          if (fixture && fixture.homeTeamId && fixture.awayTeamId) {
            state.activeMatch = {
              fixtureId,
              tournamentId,
              homeTeamId: fixture.homeTeamId,
              awayTeamId: fixture.awayTeamId,
              homeTeamName: fixture.homeTeamName,
              awayTeamName: fixture.awayTeamName,
              homeTeamPlayers: [],
              awayTeamPlayers: [],
              homeTeamSubstitutes: [],
              awayTeamSubstitutes: [],
              referees: [],
              events: [],
              homeScore: 0,
              awayScore: 0,
              startTime: new Date(),
              currentMinute: 0,
              status: 'setup',
              isExtraTime: false
            };
          }
        }),

        updateMatchRoster: (hStart, aStart, hSub, aSub) => set(state => {
          if (state.activeMatch) {
            state.activeMatch.homeTeamPlayers = hStart;
            state.activeMatch.awayTeamPlayers = aStart;
            state.activeMatch.homeTeamSubstitutes = hSub;
            state.activeMatch.awayTeamSubstitutes = aSub;
          }
        }),

        setMatchCaptains: (homeCaptain, awayCaptain) => set(state => {
          if (state.activeMatch) {
            state.activeMatch.homeCaptain = homeCaptain;
            state.activeMatch.awayCaptain = awayCaptain;
          }
        }),

        setMatchReferees: (referees) => set(state => {
          if (state.activeMatch) {
            state.activeMatch.referees = referees;
          }
        }),

        startMatch: () => set(state => {
          if (state.activeMatch) state.activeMatch.status = 'playing';
        }),

        addEvent: (eventData) => set(state => {
          if (!state.activeMatch) return;

          const newEvent: KnockoutMatchEvent = {
            ...eventData,
            id: `ke_${Date.now()}`,
            timestamp: new Date()
          };

          state.activeMatch.events.push(newEvent);

          // Score Update
          if (eventData.eventType === 'goal') {
            const isHome = eventData.teamId === state.activeMatch.homeTeamId;
            const isOwnGoal = eventData.eventSubType === 'own_goal';

            if (isOwnGoal) {
              if (isHome) state.activeMatch.awayScore++;
              else state.activeMatch.homeScore++;
            } else {
              if (isHome) state.activeMatch.homeScore++;
              else state.activeMatch.awayScore++;
            }
          }
        }),

        endMatch: () => set(state => {
          const match = state.activeMatch;
          if (!match) return;

          const tournament = state.tournaments.find(t => t.id === match.tournamentId);
          const fixture = tournament?.fixtures.find(f => f.id === match.fixtureId);

          if (tournament && fixture) {
            fixture.status = 'completed';
            fixture.homeScore = match.homeScore;
            fixture.awayScore = match.awayScore;
            fixture.matchEvents = match.events;


            let winnerId = '';
            let winnerName = '';

            if (match.homeScore > match.awayScore) {
              winnerId = match.homeTeamId;
              winnerName = match.homeTeamName;
            } else if (match.awayScore > match.homeScore) {
              winnerId = match.awayTeamId;
              winnerName = match.awayTeamName;
            } else {
              // Tie breaker (Assume Home for now, add Penalty logic later if needed)
              winnerId = match.homeTeamId;
              winnerName = match.homeTeamName;
            }

            fixture.winnerId = winnerId;

            // 1. Promote Winner to Next Round
            const nextRoundFixtures = tournament.fixtures.filter(f => f.round === fixture.round + 1);

            if (nextRoundFixtures.length > 0) {
              const currentRoundFixtures = tournament.fixtures.filter(f => f.round === fixture.round);
              currentRoundFixtures.sort((a, b) => a.matchNumber - b.matchNumber);

              const matchIndexInRound = currentRoundFixtures.findIndex(f => f.id === fixture.id);
              const nextMatchIndex = Math.floor(matchIndexInRound / 2);
              const isHomeInNext = matchIndexInRound % 2 === 0;

              const nextFixture = nextRoundFixtures[nextMatchIndex];
              if (nextFixture) {
                if (isHomeInNext) {
                  nextFixture.homeTeamId = winnerId;
                  nextFixture.homeTeamName = winnerName;
                } else {
                  nextFixture.awayTeamId = winnerId;
                  nextFixture.awayTeamName = winnerName;
                }
              }
            } else {
              tournament.winnerId = winnerId;
              tournament.status = 'completed';
            }

            // 2. CHECK ROUND COMPLETION
            const roundsMatches = tournament.fixtures.filter(f => f.round === tournament.currentRound);
            const allComplete = roundsMatches.every(f => f.status === 'completed');

            if (allComplete && tournament.currentRound < tournament.totalRounds) {
              tournament.currentRound += 1;
            }

            state.activeMatch = null;
          }
        }),

        getTournament: (id) => get().tournaments.find(t => t.id === id),
        getFixture: (tid, fid) => get().tournaments.find(t => t.id === tid)?.fixtures.find(f => f.id === fid),

        // --- NEW GETTERS ---
        getFixturesByRound: (tournamentId, round) => {
          const t = get().tournaments.find(t => t.id === tournamentId);
          if (!t) return [];
          return t.fixtures.filter(f => f.round === round).sort((a, b) => a.matchNumber - b.matchNumber);
        },

        getTournamentProgress: (tournamentId) => {
          const t = get().tournaments.find(t => t.id === tournamentId);
          if (!t || t.fixtures.length === 0) return 0;
          const completed = t.fixtures.filter(f => f.status === 'completed').length;
          return Math.round((completed / t.fixtures.length) * 100);
        }

      })),
      { name: 'knockout-store' }
    ),
    { name: 'knockout-devtools' }
  )
);