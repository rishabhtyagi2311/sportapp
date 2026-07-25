// types/football.ts — real, server-backed football profile/team/match shapes.

export interface FootballProfile {
  id: number; // footballProfile.id — the id used everywhere a "player id" is expected
  userId: number;
  nickname: string;
  role: string;
  experience: string;
  user?: { id: number; firstname: string; lastname: string };
}

export interface FootballTeam {
  id: number;
  name: string;
  location: string;
  maxPlayers: number;
  createdById: number;
  createdBy?: FootballProfile;
  members: { footballProfile: FootballProfile }[];
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
  createdAt: string;
  updatedAt: string;
}

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'abandoned';
// 'goal'/'own_goal'/'yellow_card'/'red_card'/'substitution' affect score/stats server-side
// (see MatchService); other values (foul, corner, save, penalty, free_kick, offside, injury, ...)
// are purely informational timeline entries, hence the loose string type.
export type MatchEventType = string;

export interface MatchRoster {
  startingXI: number[];
  bench: number[];
  captainId: number;
  subsUsed: number;
}

export interface MatchEvent {
  id: string;
  matchId: string;
  teamId: number;
  playerId?: number;
  relatedPlayerId?: number;
  eventType: MatchEventType;
  eventSubType?: string;
  minute: number;
  seconds: number;
  notes?: string;
  createdAt: string;
}

export interface MatchPlayerStat {
  id: string;
  matchId: string;
  playerId: number;
  teamId: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
  isStarter: boolean;
}

export interface FootballMatch {
  id: string;
  creatorId: number;
  homeTeamId: number;
  awayTeamId: number;
  homeTeam?: { id: number; name: string; location: string };
  awayTeam?: { id: number; name: string; location: string };
  matchType: 'friendly' | 'tournament';
  venueName?: string;
  playersPerTeam: number;
  allowedSubs: number;
  extraTimeAllowed: boolean;
  duration: number;
  homeRoster: MatchRoster;
  awayRoster: MatchRoster;
  referees: string[];
  status: MatchStatus;
  homeScore: number;
  awayScore: number;
  penaltyHomeScore?: number;
  penaltyAwayScore?: number;
  currentMinute: number;
  currentPossessionTeamId?: number;
  lastPossessionChangeSeconds: number;
  homePossessionSeconds: number;
  awayPossessionSeconds: number;
  startedAt?: string;
  endedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  events?: MatchEvent[];
  stats?: MatchPlayerStat[];
}

export interface PlayerCareerStats {
  matchesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  minutesPlayed: number;
}

export type TournamentFormat = 'league' | 'knockout';
export type TournamentStatus = 'draft' | 'ongoing' | 'completed' | 'cancelled';
export type TournamentEntryStatus = 'active' | 'eliminated' | 'winner';
export type TournamentFixtureStatus = 'pending' | 'ready' | 'completed';

export interface TournamentEntry {
  id: string;
  tournamentId: string;
  teamId: number;
  team?: { id: number; name: string; location: string };
  groupName?: string;
  seed?: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
  status: TournamentEntryStatus;
}

export interface TournamentFixture {
  id: string;
  tournamentId: string;
  round: number;
  groupName?: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeTeam?: { id: number; name: string };
  awayTeam?: { id: number; name: string };
  nextFixtureId?: string;
  matchId?: string;
  status: TournamentFixtureStatus;
  createdAt: string;
}

export interface Tournament {
  id: string;
  creatorId: number;
  name: string;
  description?: string;
  format: TournamentFormat;
  teamCount: number;
  matchesPerPair?: number;
  extraTimeAllowed: boolean;
  playersPerTeam: number;
  allowedSubs: number;
  venueName?: string;
  status: TournamentStatus;
  currentRound: number;
  createdAt: string;
  updatedAt: string;
  entries: TournamentEntry[];
  fixtures: TournamentFixture[];
}
