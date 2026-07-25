// store/academyEnrollmentStore.ts
import { create } from 'zustand';
import { Enrollment } from '@/types/academy';
import { academyApiService } from '@/services/academyManagement/academy';

interface EnrollmentStore {
  enrollments: Enrollment[];
  isLoading: boolean;
  error: string | null;

  fetchMyEnrollments: (childProfileId?: string) => Promise<void>;
  enrollChild: (childProfileId: string, academyId: string) => Promise<Enrollment>;
  withdrawEnrollment: (studentId: string) => Promise<void>;
  getEnrollmentsByChild: (childProfileId: string) => Enrollment[];
  isChildEnrolled: (childProfileId: string, academyId: string) => boolean;
}

export const useEnrollmentStore = create<EnrollmentStore>((set, get) => ({
  enrollments: [],
  isLoading: false,
  error: null,

  fetchMyEnrollments: async (childProfileId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getMyEnrollments(childProfileId);
      set((state) => ({
        enrollments: childProfileId
          ? [...state.enrollments.filter((e) => e.childProfileId !== childProfileId), ...response.data]
          : response.data,
        isLoading: false,
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load enrollments', isLoading: false });
    }
  },

  enrollChild: async (childProfileId, academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.enrollChild({ childProfileId, academyId });
      set((state) => ({ enrollments: [response.data, ...state.enrollments], isLoading: false }));
      return response.data;
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not enroll child';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  withdrawEnrollment: async (studentId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.withdrawEnrollment(studentId);
      set((state) => ({
        enrollments: state.enrollments.map((e) => (e.id === studentId ? response.data : e)),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not withdraw enrollment';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getEnrollmentsByChild: (childProfileId) => get().enrollments.filter((e) => e.childProfileId === childProfileId),

  // A withdrawn/rejected ('inactive') enrollment doesn't block re-enrolling —
  // the server re-requests on the same row rather than rejecting it.
  isChildEnrolled: (childProfileId, academyId) =>
    get().enrollments.some(
      (e) => e.childProfileId === childProfileId && e.academyId === academyId && e.status !== 'inactive'
    ),
}));
