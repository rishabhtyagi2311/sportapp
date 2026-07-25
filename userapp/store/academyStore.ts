import { create } from 'zustand';
import { Academy, AttendanceRecord, Certificate } from '../types/academy';
import { academyApiService } from '@/services/academyManagement/academy';

interface AcademyStore {
  academies: Academy[];
  attendance: AttendanceRecord[];
  certificates: Certificate[];
  isLoading: boolean;
  error: string | null;

  fetchAcademies: (filters?: { city?: string; sportType?: string }) => Promise<void>;
  fetchAcademyById: (id: string) => Promise<Academy | null>;
  getAcademyById: (id: string) => Academy | undefined;

  fetchChildAttendance: (studentId: string) => Promise<void>;
  getAttendanceStatus: (studentId: string, date: string) => boolean | undefined;

  fetchChildCertificates: (studentId: string) => Promise<void>;
  getCertificatesByStudent: (studentId: string) => Certificate[];
}

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  academies: [],
  attendance: [],
  certificates: [],
  isLoading: false,
  error: null,

  fetchAcademies: async (filters) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getAcademies(filters);
      set({ academies: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load academies', isLoading: false });
    }
  },

  fetchAcademyById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getAcademyById(id);
      set((state) => {
        const index = state.academies.findIndex((a) => a.id === id);
        const academies = [...state.academies];
        if (index !== -1) {
          academies[index] = response.data;
        } else {
          academies.push(response.data);
        }
        return { academies, isLoading: false };
      });
      return response.data;
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load academy', isLoading: false });
      return null;
    }
  },

  getAcademyById: (id) => get().academies.find((academy) => academy.id === id),

  fetchChildAttendance: async (studentId) => {
    try {
      const response = await academyApiService.getChildAttendance(studentId);
      set((state) => ({
        attendance: [...state.attendance.filter((a) => a.studentId !== studentId), ...response.data],
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load attendance' });
    }
  },

  getAttendanceStatus: (studentId, date) => {
    const record = get().attendance.find((a) => a.studentId === studentId && a.date === date);
    return record?.present;
  },

  fetchChildCertificates: async (studentId) => {
    try {
      const response = await academyApiService.getChildCertificates(studentId);
      set((state) => ({
        certificates: [...state.certificates.filter((c) => c.studentId !== studentId), ...response.data],
      }));
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load certificates' });
    }
  },

  getCertificatesByStudent: (studentId) => get().certificates.filter((c) => c.studentId === studentId),
}));
