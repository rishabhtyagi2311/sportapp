// store/parentAcademyProfile.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ParentProfile {
  id: string;
  fatherName: string;
  motherName: string;
  childName: string;
  childAge: string;
  address: string;
  city: string;
  createdAt?: string;
}

interface ParentStore {
  parentProfile: ParentProfile | null;
  setParentProfile: (profile: ParentProfile) => void;
  updateParentProfile: (profile: Partial<ParentProfile>) => void;
  clearParentProfile: () => void;
  hasProfile: () => boolean;
}

export const useParentStore = create<ParentStore>()(
  persist(
    (set, get) => ({
      parentProfile: null,

      setParentProfile: (profile) =>
        set({
          parentProfile: {
            ...profile,
            createdAt: profile.createdAt || new Date().toISOString(),
          },
        }),

      updateParentProfile: (updates) =>
        set((state) => ({
          parentProfile: state.parentProfile
            ? { ...state.parentProfile, ...updates }
            : null,
        })),

      clearParentProfile: () => set({ parentProfile: null }),

      hasProfile: () => {
        const state = get();
        return state.parentProfile !== null;
      },
    }),
    {
      name: 'parent-profile-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);