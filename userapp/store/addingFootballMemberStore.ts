// stores/userStore.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { User, UserState } from '../types/addingMemberTypes';

// Utility function to normalize phone numbers for comparison
const normalizePhoneNumber = (phoneNumber: string): string => {
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Handle Indian phone numbers - remove country code if present
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return cleaned.substring(2);
  }
  
  return cleaned;
};

export const useUserStore = create<UserState>()(
  devtools(
    immer((set, get) => ({
      users: [],
      isLoading: false,
      error: null,
      searchResults: [],

      setUsers: (users: User[]) => set((state) => {
        state.users = users;
        state.isLoading = false;
        state.error = null;
      }),

      addUser: (user: User) => set((state) => {
        const exists = state.users.find(u => u.id === user.id);
        if (!exists) {
          state.users.push(user);
        }
      }),

      searchUsers: (query: string) => {
        const users = get().users;
        
        if (!query.trim()) {
          return [];
        }

        const searchTerm = query.toLowerCase().trim();
        const normalizedQuery = normalizePhoneNumber(query);

        const results = users.filter(user => {
          const nameMatch = user.name.toLowerCase().includes(searchTerm);
          const phoneMatch = normalizePhoneNumber(user.contactNumber).includes(normalizedQuery);
          
          return nameMatch || phoneMatch;
        });

        // Update searchResults in state
        set((state) => {
          state.searchResults = results;
        });

        return results;
      },

      getUserByContact: (contactNumber: string) => {
        const users = get().users;
        const normalizedContact = normalizePhoneNumber(contactNumber);
        
        return users.find(user => 
          normalizePhoneNumber(user.contactNumber) === normalizedContact
        );
      },

      fetchUsers: async () => {
        set((state) => {
          state.isLoading = true;
          state.error = null;
        });

        try {
          // TODO: Replace with actual API call
          // const response = await fetch('/api/users');
          // const users = await response.json();
          
          // Mock data for now
          const mockUsers: User[] = [
            {
              id: '1',
              name: 'John Doe',
              contactNumber: '9876543210',
              email: 'john@example.com',
              isRegistered: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '2',
              name: 'Jane Smith',
              contactNumber: '9876543211',
              email: 'jane@example.com',
              isRegistered: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            {
              id: '3',
              name: 'Mike Johnson',
              contactNumber: '9876543212',
              isRegistered: true,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];

          set((state) => {
            state.users = mockUsers;
            state.isLoading = false;
          });

        } catch (error) {
          set((state) => {
            state.error = error instanceof Error ? error.message : 'Failed to fetch users';
            state.isLoading = false;
          });
        }
      },
    })),
    {
      name: 'user-store',
    }
  )
);