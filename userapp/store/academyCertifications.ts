// store/academyCertificateStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Certificate {
  id: string;
  childId: string;
  academyName: string;
  recipientName: string; 
  achievementText: string; 
  date: string;
  headCoachName: string;
}

interface CertificateStore {
  certificates: Certificate[];
  addCertificate: (cert: Certificate) => void;
  getCertificatesByChild: (childId: string) => Certificate[];
}

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      certificates: [
        {
          id: '1',
          childId: 'child_01', // Use a real ID from your childProfiles for testing
          academyName: 'Star Cricket Academy',
          recipientName: 'Rahul Kumar',
          achievementText: 'Best Bowler of the Month',
          date: 'Feb 15, 2026',
          headCoachName: 'Coach Vikram Singh',
        },
        {
          id: '2',
          childId: 'child_01',
          academyName: 'Star Cricket Academy',
          recipientName: 'Rahul Kumar',
          achievementText: 'Outstanding Discipline Award',
          date: 'Jan 20, 2026',
          headCoachName: 'Coach Vikram Singh',
        },
        {
          id: '3',
          childId: 'child_01',
          academyName: 'Elite Tennis Club',
          recipientName: 'Rahul Kumar',
          achievementText: 'Inter-Academy Runner Up',
          date: 'Dec 12, 2025',
          headCoachName: 'Sania Mirza',
        },
        {
          id: '4',
          childId: 'child_02', // Another child profile
          academyName: 'Global Football Academy',
          recipientName: 'Sneha Kapoor',
          achievementText: 'Most Improved Player',
          date: 'Feb 05, 2026',
          headCoachName: 'Coach Ricardo',
        },
        {
          id: '5',
          childId: 'child_02',
          academyName: 'Global Football Academy',
          recipientName: 'Sneha Kapoor',
          achievementText: 'Top Scorer - Winter League',
          date: 'Jan 15, 2026',
          headCoachName: 'Coach Ricardo',
        }
      ],

      addCertificate: (cert) =>
        set((state) => ({
          certificates: [...state.certificates, cert],
        })),

      getCertificatesByChild: (childId) => {
        return get().certificates.filter((cert) => cert.childId === childId);
      },
    }),
    {
      name: 'academy-certificates-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);