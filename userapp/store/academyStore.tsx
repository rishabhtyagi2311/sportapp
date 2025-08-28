import { create } from 'zustand';
import { Academy, Student, Attendance, Certificate, Coach } from '../types';
import { dummyAcademies, dummyStudents } from '../constants/dummyData';

interface AcademyStore {
  academies: Academy[];
  students: Student[];
  attendance: Attendance[];
  certificates: Certificate[];
  
  // Academy actions
  updateAcademy: (academy: Academy) => void;
  addAcademy: (academy: Academy) => void;
  getAcademies: () => Academy[];
  clearAcademies: () => void;
  getAcademyById: (id: string) => Academy | undefined;

  // Student actions
  addStudent: (student: Student) => void;
  getStudentsByAcademy: (academyId: string) => Student[];
  
  // Attendance actions
  markAttendance: (studentId: string, date: string, present: boolean) => void;
  getAttendanceStatus: (studentId: string, date: string) => boolean | undefined;
  
  // Certificate actions
  addCertificate: (certificate: Certificate) => void;
  getCertificatesByAcademy: (academyId: string) => Certificate[];

  // Coach actions
  addCoach: (academyId: string, coach: Coach) => void;
  removeCoach: (academyId: string, coachId: string) => void;
}

export const useAcademyStore = create<AcademyStore>((set, get) => ({
  academies: dummyAcademies,
  students: dummyStudents,
  attendance: [],
  certificates: [],

  addAcademy: (academy) =>
    set((state) => ({
      academies: [...state.academies, academy],
    })),
  getAcademies: () => get().academies,
  getAcademyById: (id) => get().academies.find((academy) => academy.id === id),
  clearAcademies: () => set({ academies: [] }),
  
  updateAcademy: (academy) =>
    set((state) => ({
      academies: state.academies.map((a) => (a.id === academy.id ? academy : a)),
    })),
  
  addStudent: (student) =>
    set((state) => ({
      students: [...state.students, student],
    })),
  
  getStudentsByAcademy: (academyId) => {
    return get().students.filter((student) => student.academyId === academyId);
  },
  
  markAttendance: (studentId, date, present) =>
    set((state) => {
      const existing = state.attendance.findIndex(
        (a) => a.studentId === studentId && a.date === date
      );
      if (existing >= 0) {
        const updated = [...state.attendance];
        updated[existing] = { studentId, date, present };
        return { attendance: updated };
      }
      return { attendance: [...state.attendance, { studentId, date, present }] };
    }),
  
  getAttendanceStatus: (studentId, date) => {
    const record = get().attendance.find(
      (a) => a.studentId === studentId && a.date === date
    );
    return record?.present;
  },
  
  addCertificate: (certificate) =>
    set((state) => ({
      certificates: [...state.certificates, certificate],
    })),
  
  getCertificatesByAcademy: (academyId) => {
    const students = get().getStudentsByAcademy(academyId);
    return get().certificates.filter((cert) =>
      students.some((student) => student.id === cert.studentId)
    );
  },

  // --- Coach actions ---
  addCoach: (academyId, coach) =>
    set((state) => ({
      academies: state.academies.map((a) =>
        a.id === academyId
          ? { ...a, coaches: [...(a.coaches || []), coach] }
          : a
      ),
    })),

  removeCoach: (academyId, coachId) =>
    set((state) => ({
      academies: state.academies.map((a) =>
        a.id === academyId
          ? { ...a, coaches: a.coaches?.filter((c) => c.id !== coachId) }
          : a
      ),
    })),
}));
