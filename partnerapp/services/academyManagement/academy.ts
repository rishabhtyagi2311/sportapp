// @/services/academyManagement/academy.ts
import * as FileSystem from 'expo-file-system/legacy';
import apiClient from '@/utils/apiClient';
import { Academy, Coach, Student } from '@/types';

export type CreateAcademyInput = Omit<Academy, 'id' | 'coaches'>;

export const academyApiService = {
  // --- Storage (S3 upload) ---
  getPresignedUrl: async (fileName: string, fileType: string, academyName: string) => {
    const response = await apiClient.post('/partner/storage/presigned-url', { fileName, fileType, academyName });
    return response.data;
  },

  // Uploads the local file directly via native code (not a JS Blob — React
  // Native's Blob/fetch polyfill silently produces empty/corrupted bodies
  // when piped through axios for binary PUT uploads).
  uploadToS3: async (uploadUrl: string, fileUri: string, fileType: string) => {
    const result = await FileSystem.uploadAsync(uploadUrl, fileUri, {
      httpMethod: 'PUT',
      uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
      headers: { 'Content-Type': fileType },
    });
    if (result.status < 200 || result.status >= 300) {
      throw new Error(`S3 upload failed with status ${result.status}`);
    }
    return result;
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

  getStudents: async (academyId: string, status?: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/students`, {
      params: status ? { status } : undefined,
    });
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

  approveEnrollment: async (academyId: string, studentId: string) => {
    const response = await apiClient.patch(`/partner/academies/${academyId}/students/${studentId}/approve`);
    return response.data;
  },

  rejectEnrollment: async (academyId: string, studentId: string) => {
    const response = await apiClient.patch(`/partner/academies/${academyId}/students/${studentId}/reject`);
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

  setCoverPhoto: async (academyId: string, url: string) => {
    const response = await apiClient.patch(`/partner/academies/${academyId}/cover-photo`, { url });
    return response.data;
  },

  // --- Reviews ---
  getReviews: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/reviews`);
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

  // --- Announcements ---
  createAnnouncement: async (academyId: string, content: string) => {
    const response = await apiClient.post(`/partner/academies/${academyId}/announcements`, { content });
    return response.data;
  },

  getAnnouncements: async (academyId: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/announcements`);
    return response.data;
  },

  removeAnnouncement: async (academyId: string, announcementId: string) => {
    const response = await apiClient.delete(`/partner/academies/${academyId}/announcements/${announcementId}`);
    return response.data;
  },

  // --- Demo bookings ---
  getDemoBookings: async (academyId: string, status?: string) => {
    const response = await apiClient.get(`/partner/academies/${academyId}/demo-bookings`, {
      params: status ? { status } : undefined,
    });
    return response.data;
  },

  confirmDemoBooking: async (bookingId: string) => {
    const response = await apiClient.patch(`/partner/demo-bookings/${bookingId}/confirm`);
    return response.data;
  },

  completeDemoBooking: async (bookingId: string) => {
    const response = await apiClient.patch(`/partner/demo-bookings/${bookingId}/complete`);
    return response.data;
  },

  cancelDemoBooking: async (bookingId: string) => {
    const response = await apiClient.patch(`/partner/demo-bookings/${bookingId}/cancel`);
    return response.data;
  },

  rescheduleDemoBooking: async (bookingId: string, bookingDate: string) => {
    const response = await apiClient.patch(`/partner/demo-bookings/${bookingId}/reschedule`, { bookingDate });
    return response.data;
  },
};
