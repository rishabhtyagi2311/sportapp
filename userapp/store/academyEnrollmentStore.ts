// store/enrollmentStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Enrollment {
  id: string;
  childId: string;
  childName: string;
  academyId: string;
  academyName: string;
  enrolledAt: string;
  status: 'active' | 'pending' | 'inactive';
}

interface EnrollmentStore {
  enrollments: Enrollment[];
  
  // Add enrollment
  enrollChild: (enrollment: Omit<Enrollment, 'id' | 'enrolledAt'>) => void;
  
  // Get enrollments by child
  getEnrollmentsByChild: (childId: string) => Enrollment[];
  
  // Get enrollments by academy
  getEnrollmentsByAcademy: (academyId: string) => Enrollment[];
  
  // Check if child is enrolled in academy
  isChildEnrolled: (childId: string, academyId: string) => boolean;
  
  // Remove enrollment
  removeEnrollment: (enrollmentId: string) => void;
  
  // Update enrollment status
  updateEnrollmentStatus: (enrollmentId: string, status: 'active' | 'pending' | 'inactive') => void;
}

export const useEnrollmentStore = create<EnrollmentStore>()(
  persist(
    (set, get) => ({
      enrollments: [],

      enrollChild: (enrollment) =>
        set((state) => ({
          enrollments: [
            ...state.enrollments,
            {
              ...enrollment,
              id: `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
              enrolledAt: new Date().toISOString(),
            },
          ],
        })),

      getEnrollmentsByChild: (childId) => {
        return get().enrollments.filter((e) => e.childId === childId);
      },

      getEnrollmentsByAcademy: (academyId) => {
        return get().enrollments.filter((e) => e.academyId === academyId);
      },

      isChildEnrolled: (childId, academyId) => {
        return get().enrollments.some(
          (e) => e.childId === childId && e.academyId === academyId
        );
      },

      removeEnrollment: (enrollmentId) =>
        set((state) => ({
          enrollments: state.enrollments.filter((e) => e.id !== enrollmentId),
        })),

      updateEnrollmentStatus: (enrollmentId, status) =>
        set((state) => ({
          enrollments: state.enrollments.map((e) =>
            e.id === enrollmentId ? { ...e, status } : e
          ),
        })),
    }),
    {
      name: 'enrollment-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);