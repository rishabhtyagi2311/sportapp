// types/footballPlayer.ts
export type FootballPosition = 
  | 'Goalkeeper'
  | 'Right Back'
  | 'Left Back'
  | 'Centre Back'
  | 'Defensive Midfielder'
  | 'Central Midfielder'
  | 'Attacking Midfielder'
  | 'Right Winger'
  | 'Left Winger'
  | 'Striker'
  | 'Centre Forward';

export interface FootballPlayerImage {
  id: string;
  uri: string;
  type: string; // image/jpeg, image/png
  fileName: string;
  fileSize: number;
}

export interface FootballPlayer {
  id: string;
  name: string;
  position: FootballPosition;
  isRegistered: boolean;
  
  profileImage?: string; // Main profile image URI
  createdAt: string;
  updatedAt: string;
  contact?:string;
  // Optional football-specific fields
  preferredFoot?: 'Left' | 'Right' | 'Both';
  experience?: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional';
  // Removed fields: contactNumber, email, jerseyNumber, height, weight
}

export interface FootballPlayerFormData {
  name: string;
  position: FootballPosition | '';
  images: FootballPlayerImage[];
  preferredFoot: 'Left' | 'Right' | 'Both' | '';
  experience: 'Beginner' | 'Intermediate' | 'Advanced' | 'Professional' | '';
  // Removed fields: contactNumber, email, jerseyNumber, height, weight
}

export interface FootballPlayerState {
  players: FootballPlayer[];
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setPlayers: (players: FootballPlayer[]) => void;
  addPlayer: (player: FootballPlayer) => void;
  updatePlayer: (id: string, player: Partial<FootballPlayer>) => void;
  deletePlayer: (id: string) => void;
  getPlayerById: (id: string) => FootballPlayer | undefined;
  getPlayersByPosition: (position: FootballPosition) => FootballPlayer[];
}