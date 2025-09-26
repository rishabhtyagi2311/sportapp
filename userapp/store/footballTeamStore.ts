// stores/footballStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { FootballPlayer, FootballPosition } from '../types/addingMemberTypes';

// Team interface - simplified to only store player IDs
export interface Team {
  id: string;
  teamName: string;
  maxPlayers: number;
  city: string;
  memberPlayerIds: string[]; // Only store player IDs, not full member objects
  createdAt: string;
  updatedAt: string;
  ownerId?: string;
  status: 'active' | 'inactive' | 'disbanded';
  description?: string;
  logoUrl?: string;
  achievements?: string[];
  matchesPlayed: number;
  matchesWon: number;
  matchesLost: number;
  matchesDrawn: number;
}

// Form data interface for team creation
export interface TeamFormData {
  teamName: string;
  maxPlayers: string;
  city: string;
}

// Statistics interfaces
export interface TeamStats {
  totalTeams: number;
  activeTeams: number;
  totalPlayers: number;
  averageTeamSize: number;
}

export interface PlayerStats {
  totalPlayers: number;
  playersByPosition: Record<FootballPosition, number>;
  registeredPlayers: number;
  playersWithImages: number;
}

// Unified store state interface
export interface FootballState {
  // Player state
  players: FootballPlayer[];
  
  // Team state
  teams: Team[];
  currentTeam: Team | null;
  
  // Common state
  isLoading: boolean;
  error: string | null;
  
  // Player operations
  setPlayers: (players: FootballPlayer[]) => void;
  addPlayer: (player: FootballPlayer) => void;
  updatePlayer: (id: string, playerUpdate: Partial<FootballPlayer>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => FootballPlayer | undefined;
  getPlayersByPosition: (position: FootballPosition) => FootballPlayer[];
  getPlayerStats: () => PlayerStats;
  getAllPlayers: () => FootballPlayer[]; // Get all registered players
  
  // Team operations
  addTeam: (teamData: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>) => Team;
  updateTeam: (id: string, teamData: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  getTeamById: (id: string) => Team | undefined;
  setCurrentTeam: (team: Team | null) => void;
  getTeamsByCity: (city: string) => Team[];
  getTeamStats: () => TeamStats;
  searchTeams: (query: string) => Team[];
  
  // Team-Player relationship operations
  addPlayerToTeam: (teamId: string, playerId: string) => void;
  removePlayerFromTeam: (teamId: string, playerId: string) => void;
  getTeamPlayers: (teamId: string) => FootballPlayer[]; // Get full player objects for a team
  getAvailablePlayersForTeam: (teamId: string) => FootballPlayer[]; // Players not in this team
  isPlayerInTeam: (teamId: string, playerId: string) => boolean;
  
  // Utility functions
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

// Generate unique ID
const generateId = (prefix: string): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Dummy data generation
const generateDummyPlayers = (): FootballPlayer[] => {
  const players: FootballPlayer[] = [
    {
      id: 'player_1',
      name: 'Marcus Silva',
      position: 'Goalkeeper',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      preferredFoot: 'Right',
      experience: 'Advanced',
      contact: '+91 9876543210'
    },
    {
      id: 'player_2',
      name: 'Ahmed Khan',
      position: 'Centre Back',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-16T11:00:00Z',
      updatedAt: '2024-01-16T11:00:00Z',
      preferredFoot: 'Left',
      experience: 'Professional',
      contact: '+91 9876543211'
    },
    {
      id: 'player_3',
      name: 'Rajesh Patel',
      position: 'Central Midfielder',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-17T12:00:00Z',
      updatedAt: '2024-01-17T12:00:00Z',
      preferredFoot: 'Both',
      experience: 'Intermediate',
      contact: '+91 9876543212'
    },
    {
      id: 'player_4',
      name: 'David Rodriguez',
      position: 'Striker',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-18T13:00:00Z',
      updatedAt: '2024-01-18T13:00:00Z',
      preferredFoot: 'Right',
      experience: 'Advanced',
      contact: '+91 9876543213'
    },
    {
      id: 'player_5',
      name: 'Arjun Sharma',
      position: 'Right Winger',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-19T14:00:00Z',
      updatedAt: '2024-01-19T14:00:00Z',
      preferredFoot: 'Right',
      experience: 'Beginner',
      contact: '+91 9876543214'
    },
    {
      id: 'player_6',
      name: 'Mohammed Ali',
      position: 'Left Back',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-20T15:00:00Z',
      updatedAt: '2024-01-20T15:00:00Z',
      preferredFoot: 'Left',
      experience: 'Intermediate',
      contact: '+91 9876543215'
    },
    {
      id: 'player_7',
      name: 'Vikram Singh',
      position: 'Attacking Midfielder',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-21T16:00:00Z',
      updatedAt: '2024-01-21T16:00:00Z',
      preferredFoot: 'Right',
      experience: 'Advanced',
      contact: '+91 9876543216'
    },
    {
      id: 'player_8',
      name: 'Carlos Santos',
      position: 'Centre Back',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-22T17:00:00Z',
      updatedAt: '2024-01-22T17:00:00Z',
      preferredFoot: 'Right',
      experience: 'Professional',
      contact: '+91 9876543217'
    },
    {
      id: 'player_9',
      name: 'Rohit Kumar',
      position: 'Defensive Midfielder',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-23T18:00:00Z',
      updatedAt: '2024-01-23T18:00:00Z',
      preferredFoot: 'Both',
      experience: 'Intermediate',
      contact: '+91 9876543218'
    },
    {
      id: 'player_10',
      name: 'Gabriel Martinez',
      position: 'Left Winger',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-24T19:00:00Z',
      updatedAt: '2024-01-24T19:00:00Z',
      preferredFoot: 'Left',
      experience: 'Advanced',
      contact: '+91 9876543219'
    },
    {
      id: 'player_11',
      name: 'Sanjay Gupta',
      position: 'Right Back',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-25T20:00:00Z',
      updatedAt: '2024-01-25T20:00:00Z',
      preferredFoot: 'Right',
      experience: 'Beginner',
      contact: '+91 9876543220'
    },
    {
      id: 'player_12',
      name: 'Alex Johnson',
      position: 'Centre Forward',
      isRegistered: true,
      images: [],
      createdAt: '2024-01-26T21:00:00Z',
      updatedAt: '2024-01-26T21:00:00Z',
      preferredFoot: 'Right',
      experience: 'Professional',
      contact: '+91 9876543221'
    },
    // Additional unassigned players
    {
      id: 'player_13',
      name: 'Kiran Joshi',
      position: 'Goalkeeper',
      isRegistered: true,
      images: [],
      createdAt: '2024-02-01T10:00:00Z',
      updatedAt: '2024-02-01T10:00:00Z',
      preferredFoot: 'Right',
      experience: 'Intermediate',
      contact: '+91 9876543222'
    },
    {
      id: 'player_14',
      name: 'Lucas Brown',
      position: 'Striker',
      isRegistered: true,
      images: [],
      createdAt: '2024-02-02T11:00:00Z',
      updatedAt: '2024-02-02T11:00:00Z',
      preferredFoot: 'Left',
      experience: 'Advanced',
      contact: '+91 9876543223'
    },
    {
      id: 'player_15',
      name: 'Priya Nair',
      position: 'Central Midfielder',
      isRegistered: true,
      images: [],
      createdAt: '2024-02-03T12:00:00Z',
      updatedAt: '2024-02-03T12:00:00Z',
      preferredFoot: 'Both',
      experience: 'Beginner',
      contact: '+91 9876543224'
    }
  ];
  
  return players;
};

const generateDummyTeams = (): Team[] => {
  const teams: Team[] = [
    {
      id: 'team_1',
      teamName: 'Mumbai Warriors',
      maxPlayers: 11,
      city: 'Mumbai',
      memberPlayerIds: ['player_1', 'player_2', 'player_3', 'player_4', 'player_5'],
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-25T15:30:00Z',
      status: 'active',
      description: 'Elite football team from Mumbai',
      matchesPlayed: 8,
      matchesWon: 5,
      matchesLost: 2,
      matchesDrawn: 1,
      achievements: ['City Championship 2023', 'Regional Cup Winner']
    },
    {
      id: 'team_2',
      teamName: 'Delhi Thunder',
      maxPlayers: 15,
      city: 'Delhi',
      memberPlayerIds: ['player_6', 'player_7', 'player_8', 'player_9'],
      createdAt: '2024-01-12T10:30:00Z',
      updatedAt: '2024-01-26T16:45:00Z',
      status: 'active',
      description: 'Professional football club from Delhi',
      matchesPlayed: 6,
      matchesWon: 4,
      matchesLost: 1,
      matchesDrawn: 1,
      achievements: ['State League Runner-up']
    },
    {
      id: 'team_3',
      teamName: 'Bangalore United',
      maxPlayers: 12,
      city: 'Bangalore',
      memberPlayerIds: ['player_10', 'player_11', 'player_12'],
      createdAt: '2024-01-14T11:15:00Z',
      updatedAt: '2024-01-27T17:20:00Z',
      status: 'active',
      description: 'Tech city\'s premier football team',
      matchesPlayed: 4,
      matchesWon: 2,
      matchesLost: 1,
      matchesDrawn: 1,
      achievements: ['Inter-Corporate Championship']
    },
    {
      id: 'team_4',
      teamName: 'Chennai Strikers',
      maxPlayers: 16,
      city: 'Chennai',
      memberPlayerIds: [],
      createdAt: '2024-02-01T14:00:00Z',
      updatedAt: '2024-02-01T14:00:00Z',
      status: 'active',
      description: 'Newly formed team looking for players',
      matchesPlayed: 0,
      matchesWon: 0,
      matchesLost: 0,
      matchesDrawn: 0,
      achievements: []
    }
  ];
  
  return teams;
};

// Create the unified football store
export const useFootballStore = create<FootballState>()(
  devtools(
    immer((set, get) => ({
      // Initial state with dummy data
      players: generateDummyPlayers(),
      teams: generateDummyTeams(),
      currentTeam: null,
      isLoading: false,
      error: null,

      // Player operations
      setPlayers: (players) => set((state) => {
        state.players = players;
        state.isLoading = false;
        state.error = null;
      }),

      addPlayer: (player) => set((state) => {
        const exists = state.players.find(p => p.id === player.id);
        if (!exists) {
          state.players.push(player);
          state.error = null;
        }
      }),

      updatePlayer: (id, playerUpdate) => set((state) => {
        const index = state.players.findIndex(p => p.id === id);
        if (index !== -1) {
          state.players[index] = {
            ...state.players[index],
            ...playerUpdate,
            updatedAt: new Date().toISOString(),
          };
          state.error = null;
        }
      }),

      deletePlayer: (id) => set((state) => {
        // Remove from players array
        state.players = state.players.filter(p => p.id !== id);
        
        // Remove player from all teams
        state.teams.forEach(team => {
          team.memberPlayerIds = team.memberPlayerIds.filter(playerId => playerId !== id);
          team.updatedAt = new Date().toISOString();
        });
        
        // Update current team if affected
        if (state.currentTeam && state.currentTeam.memberPlayerIds.includes(id)) {
          state.currentTeam.memberPlayerIds = state.currentTeam.memberPlayerIds.filter(playerId => playerId !== id);
          state.currentTeam.updatedAt = new Date().toISOString();
        }
        
        state.error = null;
      }),

      getPlayerById: (id) => {
        return get().players.find(p => p.id === id);
      },

      getPlayersByPosition: (position) => {
        return get().players.filter(p => p.position === position);
      },

      getAllPlayers: () => {
        return get().players;
      },

      getPlayerStats: () => {
        const players = get().players;
        const playersByPosition = {} as Record<FootballPosition, number>;
        
        // Initialize position counts
        const positions: FootballPosition[] = [
          'Goalkeeper', 'Right Back', 'Left Back', 'Centre Back',
          'Defensive Midfielder', 'Central Midfielder', 'Attacking Midfielder',
          'Right Winger', 'Left Winger', 'Striker', 'Centre Forward'
        ];
        
        positions.forEach(pos => {
          playersByPosition[pos] = 0;
        });
        
        players.forEach(player => {
          playersByPosition[player.position]++;
        });
        
        return {
          totalPlayers: players.length,
          playersByPosition,
          registeredPlayers: players.filter(p => p.isRegistered).length,
          playersWithImages: players.filter(p => p.images.length > 0).length,
        };
      },

      // Team operations
      addTeam: (teamData) => {
        const newTeam: Team = {
          ...teamData,
          id: generateId('team'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          memberPlayerIds: teamData.memberPlayerIds || [],
          status: 'active',
          matchesPlayed: 0,
          matchesWon: 0,
          matchesLost: 0,
          matchesDrawn: 0,
        };

        set((state) => {
          state.teams.push(newTeam);
          state.currentTeam = newTeam;
          state.error = null;
        });

        return newTeam;
      },

      updateTeam: (id, teamData) => set((state) => {
        const teamIndex = state.teams.findIndex(team => team.id === id);
        if (teamIndex !== -1) {
          state.teams[teamIndex] = {
            ...state.teams[teamIndex],
            ...teamData,
            updatedAt: new Date().toISOString(),
          };
          
          if (state.currentTeam?.id === id) {
            state.currentTeam = state.teams[teamIndex];
          }
          state.error = null;
        }
      }),

      deleteTeam: (id) => set((state) => {
        state.teams = state.teams.filter(team => team.id !== id);
        
        if (state.currentTeam?.id === id) {
          state.currentTeam = null;
        }
        state.error = null;
      }),

      getTeamById: (id) => {
        return get().teams.find(team => team.id === id);
      },

      setCurrentTeam: (team) => set((state) => {
        state.currentTeam = team;
      }),

      getTeamsByCity: (city) => {
        return get().teams.filter(team => 
          team.city.toLowerCase() === city.toLowerCase()
        );
      },

      getTeamStats: () => {
        const teams = get().teams;
        const activeTeams = teams.filter(team => team.status === 'active');
        const totalPlayers = teams.reduce((sum, team) => sum + team.memberPlayerIds.length, 0);
        
        return {
          totalTeams: teams.length,
          activeTeams: activeTeams.length,
          totalPlayers,
          averageTeamSize: teams.length > 0 ? totalPlayers / teams.length : 0,
        };
      },

      searchTeams: (query) => {
        const searchTerm = query.toLowerCase();
        const { players } = get();
        
        return get().teams.filter(team => {
          // Search by team name or city
          if (team.teamName.toLowerCase().includes(searchTerm) || 
              team.city.toLowerCase().includes(searchTerm)) {
            return true;
          }
          
          // Search by player names in the team
          const teamPlayers = team.memberPlayerIds
            .map(id => players.find(p => p.id === id))
            .filter(Boolean);
          
          return teamPlayers.some(player => 
            player!.name.toLowerCase().includes(searchTerm)
          );
        });
      },

      // Team-Player relationship operations
      addPlayerToTeam: (teamId, playerId) => set((state) => {
        const teamIndex = state.teams.findIndex(team => team.id === teamId);
        const player = state.players.find(p => p.id === playerId);
        
        if (teamIndex !== -1 && player) {
          const team = state.teams[teamIndex];
          
          // Check if player is already in team
          if (!team.memberPlayerIds.includes(playerId)) {
            // Check team capacity
            if (team.memberPlayerIds.length < team.maxPlayers) {
              team.memberPlayerIds.push(playerId);
              team.updatedAt = new Date().toISOString();
              
              // Update current team if it's the same
              if (state.currentTeam?.id === teamId) {
                state.currentTeam = team;
              }
              state.error = null;
            } else {
              state.error = 'Team is at maximum capacity';
            }
          } else {
            state.error = 'Player is already in this team';
          }
        } else if (!player) {
          state.error = 'Player not found';
        } else {
          state.error = 'Team not found';
        }
      }),

      removePlayerFromTeam: (teamId, playerId) => set((state) => {
        const teamIndex = state.teams.findIndex(team => team.id === teamId);
        if (teamIndex !== -1) {
          const team = state.teams[teamIndex];
          team.memberPlayerIds = team.memberPlayerIds.filter(id => id !== playerId);
          team.updatedAt = new Date().toISOString();
          
          // Update current team if it's the same
          if (state.currentTeam?.id === teamId) {
            state.currentTeam = team;
          }
          state.error = null;
        }
      }),

      getTeamPlayers: (teamId) => {
        const team = get().teams.find(t => t.id === teamId);
        const players = get().players;
        
        if (!team) return [];
        
        return team.memberPlayerIds
          .map(id => players.find(p => p.id === id))
          .filter((player): player is FootballPlayer => player !== undefined);
      },

      getAvailablePlayersForTeam: (teamId) => {
        const team = get().teams.find(t => t.id === teamId);
        const players = get().players;
        
        if (!team) return players;
        
        return players.filter(player => !team.memberPlayerIds.includes(player.id));
      },

      isPlayerInTeam: (teamId, playerId) => {
        const team = get().teams.find(t => t.id === teamId);
        return team ? team.memberPlayerIds.includes(playerId) : false;
      },

      // Utility functions
      setLoading: (loading) => set((state) => {
        state.isLoading = loading;
      }),

      setError: (error) => set((state) => {
        state.error = error;
      }),

      clearError: () => set((state) => {
        state.error = null;
      }),
    })),
    {
      name: 'football-store',
    }
  )
);