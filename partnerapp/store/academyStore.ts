import { create } from 'zustand';
import { Academy, Student, Attendance, Certificate, Coach, AcademyPhoto, Review } from '../types';
import { academyApiService, CreateAcademyInput } from '@/services/academyManagement/academy';

interface AcademyStore {
  academies: Academy[];
  students: Student[];
  pendingEnrollments: Student[];
  attendance: Attendance[];
  certificates: Certificate[];
  photos: AcademyPhoto[];
  reviews: Review[];
  isLoading: boolean;
  error: string | null;

  // Academy actions (API-backed)
  fetchMyAcademies: () => Promise<void>;
  createAcademy: (academy: CreateAcademyInput) => Promise<void>;
  updateAcademy: (academyId: string, updates: Partial<CreateAcademyInput>) => Promise<void>;
  deleteAcademy: (academyId: string) => Promise<void>;
  getAcademyById: (id: string) => Academy | undefined;

  // Coach actions (API-backed)
  addCoach: (academyId: string, coach: Omit<Coach, 'id'>) => Promise<void>;
  updateCoach: (academyId: string, coachId: string, updates: Partial<Omit<Coach, 'id'>>) => Promise<void>;
  removeCoach: (academyId: string, coachId: string) => Promise<void>;

  // Student actions (API-backed)
  fetchStudents: (academyId: string) => Promise<void>;
  addStudent: (academyId: string, student: Omit<Student, 'id' | 'academyId' | 'enrollmentDate'>) => Promise<void>;
  updateStudent: (academyId: string, studentId: string, updates: Partial<Omit<Student, 'id' | 'academyId' | 'enrollmentDate'>>) => Promise<void>;
  removeStudent: (academyId: string, studentId: string) => Promise<void>;
  getStudentsByAcademy: (academyId: string) => Student[];

  // Pending enrollment approval (API-backed, kept separate from the main roster)
  fetchPendingEnrollments: (academyId: string) => Promise<void>;
  approveEnrollment: (academyId: string, studentId: string) => Promise<void>;
  rejectEnrollment: (academyId: string, studentId: string) => Promise<void>;

  // Attendance actions (API-backed)
  fetchAcademyAttendance: (academyId: string, date?: string) => Promise<void>;
  fetchStudentAttendance: (studentId: string) => Promise<void>;
  markAttendance: (studentId: string, date: string, present: boolean) => Promise<void>;
  getAttendanceStatus: (studentId: string, date: string) => boolean | undefined;

  // Certificate actions (API-backed)
  fetchCertificates: (academyId: string) => Promise<void>;
  createCertificate: (studentId: string, template: string, achievement: string) => Promise<Certificate>;
  getCertificatesByAcademy: (academyId: string) => Certificate[];

  // Photo actions (API-backed)
  fetchPhotos: (academyId: string) => Promise<void>;
  addPhoto: (academyId: string, url: string) => Promise<void>;
  removePhoto: (academyId: string, photoId: string) => Promise<void>;
  setCoverPhoto: (academyId: string, url: string) => Promise<void>;
  getPhotosByAcademy: (academyId: string) => AcademyPhoto[];

  // Review actions (API-backed)
  fetchReviews: (academyId: string) => Promise<void>;
  getReviewsByAcademy: (academyId: string) => Review[];
}

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  academies: [],
  students: [],
  pendingEnrollments: [],
  attendance: [],
  certificates: [],
  photos: [],
  reviews: [],
  isLoading: false,
  error: null,

  // --- Academy Implementation ---
  fetchMyAcademies: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getMyAcademies();
      if (response.success) {
        set({ academies: response.data, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load academies', isLoading: false });
    }
  },

  createAcademy: async (academy) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.createAcademy(academy);
      if (response.success) {
        set((state) => ({ academies: [response.data, ...state.academies], isLoading: false }));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to register academy';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  getAcademyById: (id) => get().academies.find((academy) => academy.id === id),

  updateAcademy: async (academyId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.updateAcademy(academyId, updates);
      if (response.success) {
        set((state) => ({
          academies: state.academies.map((a) => (a.id === academyId ? response.data : a)),
          isLoading: false,
        }));
      }
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to update academy';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  deleteAcademy: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      await academyApiService.deleteAcademy(academyId);
      set((state) => ({
        academies: state.academies.filter((a) => a.id !== academyId),
        isLoading: false,
      }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Failed to delete academy';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  // --- Coach Implementation ---
  addCoach: async (academyId, coach) => {
    const response = await academyApiService.addCoach(academyId, coach);
    if (response.success) {
      set((state) => ({
        academies: state.academies.map((a) =>
          a.id === academyId ? { ...a, coaches: [...(a.coaches || []), response.data] } : a
        ),
      }));
    }
  },

  updateCoach: async (academyId, coachId, updates) => {
    const response = await academyApiService.updateCoach(academyId, coachId, updates);
    if (response.success) {
      set((state) => ({
        academies: state.academies.map((a) =>
          a.id === academyId
            ? { ...a, coaches: a.coaches?.map((c) => (c.id === coachId ? response.data : c)) }
            : a
        ),
      }));
    }
  },

  removeCoach: async (academyId, coachId) => {
    await academyApiService.removeCoach(academyId, coachId);
    set((state) => ({
      academies: state.academies.map((a) =>
        a.id === academyId ? { ...a, coaches: a.coaches?.filter((c) => c.id !== coachId) } : a
      ),
    }));
  },

  // --- Student Implementation ---
  fetchStudents: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getStudents(academyId);
      if (response.success) {
        set((state) => ({
          students: [...state.students.filter((s) => s.academyId !== academyId), ...response.data],
          isLoading: false,
        }));
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load students', isLoading: false });
    }
  },

  // --- Pending Enrollment Implementation ---
  fetchPendingEnrollments: async (academyId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await academyApiService.getStudents(academyId, 'pending');
      if (response.success) {
        set({ pendingEnrollments: response.data, isLoading: false });
      }
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Failed to load enrollment requests', isLoading: false });
    }
  },

  approveEnrollment: async (academyId, studentId) => {
    const response = await academyApiService.approveEnrollment(academyId, studentId);
    if (!response.success) {
      throw new Error(response.message || 'Could not approve enrollment');
    }
    set((state) => ({
      pendingEnrollments: state.pendingEnrollments.filter((s) => s.id !== studentId),
      students: [...state.students.filter((s) => s.id !== studentId), response.data],
    }));
  },

  rejectEnrollment: async (academyId, studentId) => {
    const response = await academyApiService.rejectEnrollment(academyId, studentId);
    if (!response.success) {
      throw new Error(response.message || 'Could not reject enrollment');
    }
    set((state) => ({
      pendingEnrollments: state.pendingEnrollments.filter((s) => s.id !== studentId),
    }));
  },

  addStudent: async (academyId, student) => {
    const response = await academyApiService.addStudent(academyId, student);
    if (response.success) {
      set((state) => ({ students: [response.data, ...state.students] }));
    }
  },

  updateStudent: async (academyId, studentId, updates) => {
    const response = await academyApiService.updateStudent(academyId, studentId, updates);
    if (response.success) {
      set((state) => ({
        students: state.students.map((s) => (s.id === studentId ? response.data : s)),
      }));
    }
  },

  removeStudent: async (academyId, studentId) => {
    await academyApiService.removeStudent(academyId, studentId);
    set((state) => ({ students: state.students.filter((s) => s.id !== studentId) }));
  },

  getStudentsByAcademy: (academyId) => {
    return get().students.filter((student) => student.academyId === academyId);
  },

  // --- Attendance Implementation ---
  fetchAcademyAttendance: async (academyId, date) => {
    const response = await academyApiService.getAcademyAttendance(academyId, date);
    if (response.success) {
      const studentIds = new Set(get().getStudentsByAcademy(academyId).map((s) => s.id));
      set((state) => ({
        attendance: [...state.attendance.filter((a) => !studentIds.has(a.studentId)), ...response.data],
      }));
    }
  },

  fetchStudentAttendance: async (studentId) => {
    const response = await academyApiService.getStudentAttendance(studentId);
    if (response.success) {
      set((state) => ({
        attendance: [...state.attendance.filter((a) => a.studentId !== studentId), ...response.data],
      }));
    }
  },

  markAttendance: async (studentId, date, present) => {
    const response = await academyApiService.markAttendance(studentId, date, present);
    if (response.success) {
      set((state) => {
        const existing = state.attendance.findIndex((a) => a.studentId === studentId && a.date === date);
        if (existing >= 0) {
          const updated = [...state.attendance];
          updated[existing] = response.data;
          return { attendance: updated };
        }
        return { attendance: [...state.attendance, response.data] };
      });
    }
  },

  getAttendanceStatus: (studentId, date) => {
    const record = get().attendance.find(
      (a) => a.studentId === studentId && a.date === date
    );
    return record?.present;
  },

  // --- Certificate Implementation ---
  fetchCertificates: async (academyId) => {
    const response = await academyApiService.getAcademyCertificates(academyId);
    if (response.success) {
      const studentIds = new Set(get().getStudentsByAcademy(academyId).map((s) => s.id));
      set((state) => ({
        certificates: [...state.certificates.filter((c) => !studentIds.has(c.studentId)), ...response.data],
      }));
    }
  },

  createCertificate: async (studentId, template, achievement) => {
    const response = await academyApiService.createCertificate(studentId, template, achievement);
    if (!response.success) {
      throw new Error(response.message || 'Could not generate certificate');
    }
    set((state) => ({ certificates: [response.data, ...state.certificates] }));
    return response.data;
  },

  getCertificatesByAcademy: (academyId) => {
    const students = get().getStudentsByAcademy(academyId);
    const studentIds = new Set(students.map((s) => s.id));
    return get().certificates.filter((cert) => studentIds.has(cert.studentId));
  },

  // --- Photo Implementation ---
  fetchPhotos: async (academyId) => {
    const response = await academyApiService.getPhotos(academyId);
    if (response.success) {
      set((state) => ({
        photos: [...state.photos.filter((p) => p.academyId !== academyId), ...response.data],
      }));
    }
  },

  addPhoto: async (academyId, url) => {
    const response = await academyApiService.addPhoto(academyId, url);
    if (response.success) {
      set((state) => ({ photos: [response.data, ...state.photos] }));
    }
  },

  removePhoto: async (academyId, photoId) => {
    await academyApiService.removePhoto(academyId, photoId);
    set((state) => ({ photos: state.photos.filter((p) => p.id !== photoId) }));
  },

  setCoverPhoto: async (academyId, url) => {
    const response = await academyApiService.setCoverPhoto(academyId, url);
    if (response.success) {
      set((state) => ({
        academies: state.academies.map((a) => (a.id === academyId ? response.data : a)),
      }));
    }
  },

  getPhotosByAcademy: (academyId) => {
    return get().photos.filter((p) => p.academyId === academyId);
  },

  // --- Review Implementation ---
  fetchReviews: async (academyId) => {
    const response = await academyApiService.getReviews(academyId);
    if (response.success) {
      set((state) => ({
        reviews: [...state.reviews.filter((r) => r.academyId !== academyId), ...response.data],
      }));
    }
  },

  getReviewsByAcademy: (academyId) => {
    return get().reviews.filter((r) => r.academyId === academyId);
  },
}));
