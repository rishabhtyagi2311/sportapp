// store/academyChildProfile.ts
import { create } from 'zustand';
import { ChildProfile } from '@/types/academy';
import { academyApiService } from '@/services/academyManagement/academy';

interface ChildStore {
  childProfiles: ChildProfile[];
  isLoading: boolean;
  error: string | null;

  fetchMyChildProfiles: () => Promise<void>;
  createChildProfile: (profile: {
    childName: string;
    childAge: number;
    motherName?: string;
    fatherName: string;
    fatherContact?: string;
    address?: string;
    city?: string;
  }) => Promise<ChildProfile>;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => Promise<void>;
  deleteChildProfile: (id: string) => Promise<void>;
  hasProfiles: () => boolean;
}

export const usechildStore = create<ChildStore>((set, get) => ({
  childProfiles: [],
  isLoading: false,
  error: null,

  fetchMyChildProfiles: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getMyChildProfiles();
      set({ childProfiles: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load child profiles', isLoading: false });
    }
  },

  createChildProfile: async (profile) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.createChildProfile(profile);
      set((state) => ({ childProfiles: [response.data, ...state.childProfiles], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not create child profile';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  updateChildProfile: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.updateChildProfile(id, updates);
      set((state) => ({
        childProfiles: state.childProfiles.map((profile) => (profile.id === id ? response.data : profile)),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not update child profile';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteChildProfile: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await academyApiService.deleteChildProfile(id);
      set((state) => ({
        childProfiles: state.childProfiles.filter((profile) => profile.id !== id),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not delete child profile';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  hasProfiles: () => get().childProfiles.length > 0,
}));
