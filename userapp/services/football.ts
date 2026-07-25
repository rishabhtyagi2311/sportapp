import apiClient from "@/utils/apiClient";
import { FootballProfile, FootballTeam, FootballMatch, MatchEvent, MatchRoster, PlayerCareerStats, Tournament } from "@/types/football";

interface FootballProfileData {
  role: string;
  nickname: string;
  experience: string;
}

interface CreateTeamPayload {
  name: string;
  location: string;
  maxPlayers: number;
  playerIds: number[];
}

interface CreateMatchPayload {
  homeTeamId: number;
  awayTeamId: number;
  venueName?: string;
  playersPerTeam: number;
  allowedSubs: number;
  extraTimeAllowed: boolean;
  duration: number;
  homeRoster: MatchRoster;
  awayRoster: MatchRoster;
  referees: string[];
}

class FootballService {
  async profileRegister(data: FootballProfileData): Promise<{ success: boolean; data: FootballProfile } | null> {
    try {
      const response = await apiClient.post(`/user/football/profile`, data);
      return response?.data ?? null;
    } catch (e) {
      console.error("Error in profileRegister:", e);
      return null;
    }
  }

  async profileCheck(): Promise<{ success: boolean; data: { exists: boolean; profile: FootballProfile | null } } | null> {
    try {
      const response = await apiClient.get(`/user/football/profile/check`);
      return response?.data ?? null;
    } catch (e) {
      console.error("Error in profile check:", e);
      return null;
    }
  }

  async createTeam(payload: CreateTeamPayload): Promise<FootballTeam | null> {
    try {
      const response = await apiClient.post(`/user/football/teams`, payload);
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in createTeam:", e);
      return null;
    }
  }

  async fetchAllPlayers(): Promise<FootballProfile[]> {
    try {
      const response = await apiClient.get(`/user/football/players`);
      return response?.data?.players ?? [];
    } catch (e) {
      console.error("Error in fetchAllPlayers:", e);
      return [];
    }
  }

  async fetchMyTeams(): Promise<FootballTeam[]> {
    try {
      const response = await apiClient.get(`/user/football/teams/mine`);
      return response?.data?.data ?? [];
    } catch (e) {
      console.error("Error in fetchMyTeams:", e);
      return [];
    }
  }

  async fetchAllTeams(): Promise<FootballTeam[]> {
    try {
      const response = await apiClient.get(`/user/football/teams`);
      return response?.data?.data ?? [];
    } catch (e) {
      console.error("Error in fetchAllTeams:", e);
      return [];
    }
  }

  async fetchTeamById(teamId: number): Promise<FootballTeam | null> {
    try {
      const response = await apiClient.get(`/user/football/teams/${teamId}`);
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in fetchTeamById:", e);
      return null;
    }
  }

  async addTeamMember(teamId: number, playerId: number): Promise<FootballTeam | null> {
    try {
      const response = await apiClient.post(`/user/football/teams/${teamId}/members`, { playerId });
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in addTeamMember:", e);
      return null;
    }
  }

  async fetchTeamMatches(teamId: number): Promise<FootballMatch[]> {
    try {
      const response = await apiClient.get(`/user/football/teams/${teamId}/matches`);
      return response?.data?.data ?? [];
    } catch (e) {
      console.error("Error in fetchTeamMatches:", e);
      return [];
    }
  }

  async fetchPlayerStats(profileId: number): Promise<PlayerCareerStats | null> {
    try {
      const response = await apiClient.get(`/user/football/players/${profileId}/stats`);
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in fetchPlayerStats:", e);
      return null;
    }
  }

  async createMatch(payload: CreateMatchPayload): Promise<FootballMatch> {
    const response = await apiClient.post(`/user/football/matches`, payload);
    return response.data.data;
  }

  async startMatch(matchId: string): Promise<FootballMatch> {
    const response = await apiClient.post(`/user/football/matches/${matchId}/start`);
    return response.data.data;
  }

  async abandonMatch(matchId: string, reason?: string): Promise<FootballMatch> {
    const response = await apiClient.post(`/user/football/matches/${matchId}/abandon`, { reason });
    return response.data.data;
  }

  async addMatchEvent(
    matchId: string,
    data: {
      teamId: number;
      playerId?: number;
      relatedPlayerId?: number;
      eventType: string;
      eventSubType?: string;
      minute: number;
      seconds: number;
      notes?: string;
    }
  ): Promise<MatchEvent> {
    const response = await apiClient.post(`/user/football/matches/${matchId}/events`, data);
    return response.data.data;
  }

  async updatePossession(matchId: string, teamId: number, currentSeconds: number): Promise<FootballMatch> {
    const response = await apiClient.patch(`/user/football/matches/${matchId}/possession`, { teamId, currentSeconds });
    return response.data.data;
  }

  async endMatch(
    matchId: string,
    data: { penaltyHomeScore?: number; penaltyAwayScore?: number; notes?: string }
  ): Promise<FootballMatch> {
    const response = await apiClient.post(`/user/football/matches/${matchId}/end`, data);
    return response.data.data;
  }

  async fetchMatchById(matchId: string): Promise<FootballMatch | null> {
    try {
      const response = await apiClient.get(`/user/football/matches/${matchId}`);
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in fetchMatchById:", e);
      return null;
    }
  }

  async fetchMyMatches(): Promise<FootballMatch[]> {
    try {
      const response = await apiClient.get(`/user/football/matches/mine`);
      return response?.data?.data ?? [];
    } catch (e) {
      console.error("Error in fetchMyMatches:", e);
      return [];
    }
  }

  async createTournament(payload: {
    name: string;
    description?: string;
    format: 'league' | 'knockout';
    teamIds: number[];
    matchesPerPair?: number;
    extraTimeAllowed: boolean;
    playersPerTeam: number;
    allowedSubs: number;
    venueName?: string;
  }): Promise<Tournament> {
    const response = await apiClient.post(`/user/football/tournaments`, payload);
    return response.data.data;
  }

  async startTournament(tournamentId: string): Promise<Tournament> {
    const response = await apiClient.post(`/user/football/tournaments/${tournamentId}/start`);
    return response.data.data;
  }

  async startFixtureMatch(
    tournamentId: string,
    fixtureId: string,
    data: { duration: number; homeRoster: MatchRoster; awayRoster: MatchRoster; referees: string[] }
  ): Promise<FootballMatch> {
    const response = await apiClient.post(
      `/user/football/tournaments/${tournamentId}/fixtures/${fixtureId}/start-match`,
      data
    );
    return response.data.data;
  }

  async fetchTournamentById(tournamentId: string): Promise<Tournament | null> {
    try {
      const response = await apiClient.get(`/user/football/tournaments/${tournamentId}`);
      return response?.data?.data ?? null;
    } catch (e) {
      console.error("Error in fetchTournamentById:", e);
      return null;
    }
  }

  async fetchMyTournaments(): Promise<Tournament[]> {
    try {
      const response = await apiClient.get(`/user/football/tournaments/mine`);
      return response?.data?.data ?? [];
    } catch (e) {
      console.error("Error in fetchMyTournaments:", e);
      return [];
    }
  }

  async deleteTournament(tournamentId: string): Promise<void> {
    await apiClient.delete(`/user/football/tournaments/${tournamentId}`);
  }
}

export const footballService = new FootballService();
