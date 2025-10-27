// store/academyChildProfile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ChildProfile {
  id: string;
  fatherName: string;
  motherName: string;
  childName: string;
  childAge: string;
  address: string;
  city: string;
  createdAt?: string;
}

interface ChildStore {
  childProfiles: ChildProfile[];
  addChildProfile: (profile: ChildProfile) => void;
  updateChildProfile: (id: string, profile: Partial<ChildProfile>) => void;
  deleteChildProfile: (id: string) => void;
  hasProfiles: () => boolean;
}

export const usechildStore = create<ChildStore>()(
  persist(
    (set, get) => ({
      childProfiles: [],

      addChildProfile: (profile) =>
        set((state) => ({
          childProfiles: [
            ...state.childProfiles,
            {
              ...profile,
              createdAt: profile.createdAt || new Date().toISOString(),
            },
          ],
        })),

      updateChildProfile: (id, updates) =>
        set((state) => ({
          childProfiles: state.childProfiles.map((profile) =>
            profile.id === id ? { ...profile, ...updates } : profile
          ),
        })),

      deleteChildProfile: (id) =>
        set((state) => ({
          childProfiles: state.childProfiles.filter((profile) => profile.id !== id),
        })),

      hasProfiles: () => {
        const state = get();
        return state.childProfiles.length > 0;
      },
    }),
    {
      name: 'child-profiles-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);