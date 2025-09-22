// types/user.ts
export interface User {
  id: string;
  name: string;
  contactNumber: string;
  email?: string;
  isRegistered: boolean;
  profileImage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactFromPhone {
  id: string;
  name: string;
  phoneNumbers: string[];
  isRegistered?: boolean;
}

export interface TeamMember {
  userId?: string; // For registered users
  name: string;
  contactNumber: string;
  isRegistered: boolean;
  invitedAt?: string;
  joinedAt?: string;
  position?: string; // Player position (optional)
}

export interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  searchResults: User[];
  
  // Actions
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  searchUsers: (query: string) => User[];
  getUserByContact: (contactNumber: string) => User | undefined;
  fetchUsers: () => Promise<void>;
}