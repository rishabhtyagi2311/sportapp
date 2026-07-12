// @/services/academyManagement/academy.ts
import axios from 'axios';
import apiClient from '@/utils/apiClient';
import { Academy, Coach, Student } from '@/types';

export type CreateAcademyInput = Omit<Academy, 'id' | 'coaches'>;

export const academyApiService = {
  // --- Storage (S3 upload) ---
  getPresignedUrl: async (fileName: string, fileType: string, academyName: string) => {
    const response = await apiClient.post('/partner/storage/presigned-url', { fileName, fileType, academyName });
    return response.data;
  },

  uploadToS3: async (uploadUrl: string, blob: Blob, fileType: string) => {
    return await axios.put(uploadUrl, blob, {
      headers: { 'Content-Type': fileType },
    });
  },

  createAcademy: async (payload: CreateAcademyInput) => {
    const response = await apiClient.post('/partner/academies', payload);
    return response.data;
  },

  getMyAcademies: async () => {
    const response = await apiClient.get('/partner/academies');
    return response.data;
  },

  getAcademyById: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}`);
    return response.data;
  },

  updateAcademy: async (academyId: string, updates: Partial<CreateAcademyInput>) => {
    const response = await apiClient.put(`/partner/academies/${academyId}`, updates);
    return response.data;
  },

  deleteAcademy: async (academyId: string) => {
    const response = await apiClient.delete(`/partner/academies/${academyId}`);
    return response.data;
  },

  addCoach: async (academyId: string, coach: Omit<Coach, 'id'>) => {
    const response = await apiClient.post(`/partner/academies/${academyId}/coaches`, coach);
    return response.data;
  },

  updateCoach: async (academyId: string, coachId: string, updates: Partial<Omit<Coach, 'id'>>) => {
    const response = await apiClient.put(`/partner/academies/${academyId}/coaches/${coachId}`, updates);
    return response.data;
  },

  removeCoach: async (academyId: string, coachId: string) => {
    const response = await apiClient.delete(`/partner/academies/${academyId}/coaches/${coachId}`);
    return response.data;
  },

  // --- Students ---
  addStudent: async (academyId: string, student: Omit<Student, 'id' | 'academyId' | 'enrollmentDate'>) => {
    const response = await apiClient.post(`/partner/academies/${academyId}/students`, student);
    return response.data;
  },

  getStudents: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/students`);
    return response.data;
  },

  updateStudent: async (academyId: string, studentId: string, updates: Partial<Omit<Student, 'id' | 'academyId' | 'enrollmentDate'>>) => {
    const response = await apiClient.put(`/partner/academies/${academyId}/students/${studentId}`, updates);
    return response.data;
  },

  removeStudent: async (academyId: string, studentId: string) => {
    const response = await apiClient.delete(`/partner/academies/${academyId}/students/${studentId}`);
    return response.data;
  },

  // --- Attendance ---
  markAttendance: async (studentId: string, date: string, present: boolean) => {
    const response = await apiClient.post(`/partner/students/${studentId}/attendance`, { date, present });
    return response.data;
  },

  getAcademyAttendance: async (academyId: string, date?: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/attendance`, { params: date ? { date } : undefined });
    return response.data;
  },

  getStudentAttendance: async (studentId: string) => {
    const response = await apiClient.get(`/partner/students/${studentId}/attendance`);
    return response.data;
  },

  // --- Photos ---
  addPhoto: async (academyId: string, url: string) => {
    const response = await apiClient.post(`/partner/academies/${academyId}/photos`, { url });
    return response.data;
  },

  getPhotos: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/photos`);
    return response.data;
  },

  removePhoto: async (academyId: string, photoId: string) => {
    const response = await apiClient.delete(`/partner/academies/${academyId}/photos/${photoId}`);
    return response.data;
  },

  // --- Certificates ---
  createCertificate: async (studentId: string, template: string, achievement: string) => {
    const response = await apiClient.post(`/partner/students/${studentId}/certificates`, { template, achievement });
    return response.data;
  },

  getAcademyCertificates: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/certificates`);
    return response.data;
  },
};
