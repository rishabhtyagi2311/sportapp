// store/footballTeamStore.ts — real, server-backed football profile/team store.
import { create } from 'zustand';
import { footballService } from '@/services/football';
import { FootballProfile, FootballTeam } from '@/types/football';

interface FootballTeamState {
  profile: FootballProfile | null;
  players: FootballProfile[];
  teams: FootballTeam[]; // all teams — browsable (e.g. opponent selection)
  myTeams: FootballTeam[]; // teams the current user created or is a member of
  isLoading: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  registerProfile: (data: { role: string; nickname: string; experience: string }) => Promise<FootballProfile>;
  fetchAllPlayers: () => Promise<void>;
  fetchAllTeams: () => Promise<void>;
  fetchMyTeams: () => Promise<void>;
  fetchTeamById: (id: number) => Promise<FootballTeam | null>;
  createTeam: (data: { name: string; location: string; maxPlayers: number; playerIds: number[] }) => Promise<FootballTeam>;
  addTeamMember: (teamId: number, playerId: number) => Promise<void>;
  updateCaptain: (teamId: number, captainId: number) => Promise<void>;
  removeTeamMember: (teamId: number, playerId: number) => Promise<void>;

  getTeamById: (id: number) => FootballTeam | undefined;
  getPlayerById: (id: number) => FootballProfile | undefined;
  getTeamPlayers: (teamId: number) => FootballProfile[];
  getAvailablePlayersForTeam: (teamId: number) => FootballProfile[];
}

function upsertTeam(list: FootballTeam[], team: FootballTeam): FootballTeam[] {
  const index = list.findIndex((t) => t.id === team.id);
  if (index === -1) return [...list, team];
  const next = [...list];
  next[index] = team;
  return next;
}

export const useFootballStore = create<FootballTeamState>((set, get) => ({
  profile: null,
  players: [],
  teams: [],
  myTeams: [],
  isLoading: false,
  error: null,

  fetchProfile: async () => {
    set({ isLoading: true, error: null });
    const response = await footballService.profileCheck();
    set({ profile: response?.data.exists ? response.data.profile : null, isLoading: false });
  },

  registerProfile: async (data) => {
    set({ isLoading: true, error: null });
    const response = await footballService.profileRegister(data);
    if (!response?.success) {
      const message = 'Could not create football profile';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
    set({ profile: response.data, isLoading: false });
    return response.data;
  },

  fetchAllPlayers: async () => {
    set({ isLoading: true, error: null });
    const players = await footballService.fetchAllPlayers();
    set({ players, isLoading: false });
  },

  fetchAllTeams: async () => {
    set({ isLoading: true, error: null });
    const teams = await footballService.fetchAllTeams();
    set({ teams, isLoading: false });
  },

  fetchMyTeams: async () => {
    set({ isLoading: true, error: null });
    const myTeams = await footballService.fetchMyTeams();
    set({ myTeams, isLoading: false });
  },

  fetchTeamById: async (id) => {
    const team = await footballService.fetchTeamById(id);
    if (team) {
      set((state) => ({ teams: upsertTeam(state.teams, team), myTeams: upsertTeam(state.myTeams, team) }));
    }
    return team;
  },

  createTeam: async (data) => {
    set({ isLoading: true, error: null });
    const team = await footballService.createTeam(data);
    if (!team) {
      const message = 'Could not create team';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
    set((state) => ({
      teams: upsertTeam(state.teams, team),
      myTeams: upsertTeam(state.myTeams, team),
      isLoading: false,
    }));
    return team;
  },

  addTeamMember: async (teamId, playerId) => {
    set({ isLoading: true, error: null });
    const team = await footballService.addTeamMember(teamId, playerId);
    if (!team) {
      const message = 'Could not add member to team';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
    set((state) => ({
      teams: upsertTeam(state.teams, team),
      myTeams: upsertTeam(state.myTeams, team),
      isLoading: false,
    }));
  },

  updateCaptain: async (teamId, captainId) => {
    set({ isLoading: true, error: null });
    const team = await footballService.updateCaptain(teamId, captainId);
    if (!team) {
      const message = 'Could not update captain';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
    set((state) => ({
      teams: upsertTeam(state.teams, team),
      myTeams: upsertTeam(state.myTeams, team),
      isLoading: false,
    }));
  },

  removeTeamMember: async (teamId, playerId) => {
    set({ isLoading: true, error: null });
    const team = await footballService.removeTeamMember(teamId, playerId);
    if (!team) {
      const message = 'Could not remove member from team';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
    set((state) => ({
      teams: upsertTeam(state.teams, team),
      myTeams: upsertTeam(state.myTeams, team),
      isLoading: false,
    }));
  },

  getTeamById: (id) => {
    const { teams, myTeams } = get();
    return teams.find((t) => t.id === id) ?? myTeams.find((t) => t.id === id);
  },

  getPlayerById: (id) => get().players.find((p) => p.id === id),

  getTeamPlayers: (teamId) => {
    const team = get().getTeamById(teamId);
    return team ? team.members.map((m) => m.footballProfile) : [];
  },

  getAvailablePlayersForTeam: (teamId) => {
    const team = get().getTeamById(teamId);
    const { players } = get();
    if (!team) return players;
    const memberIds = new Set(team.members.map((m) => m.footballProfile.id));
    return players.filter((p) => !memberIds.has(p.id));
  },
}));
