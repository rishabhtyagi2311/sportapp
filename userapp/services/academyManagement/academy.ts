// @/services/academyManagement/academy.ts
import apiClient from '@/utils/apiClient';
import {
  Academy,
  ChildProfile,
  Enrollment,
  AttendanceRecord,
  Certificate,
  Announcement,
  DemoBooking,
  Review,
} from '@/types/academy';

export const academyApiService = {
  // --- Browse (public) ---
  getAcademies: async (filters?: { city?: string; sportType?: string }): Promise<{ success: boolean; data: Academy[] }> => {
    const response = await apiClient.get('/user/academies', { params: filters });
    return response.data;
  },

  getAcademyById: async (academyId: string): Promise<{ success: boolean; data: Academy }> => {
    const response = await apiClient.get(`/user/academies/${academyId}`);
    return response.data;
  },

  getAnnouncements: async (academyId: string): Promise<{ success: boolean; data: Announcement[] }> => {
    const response = await apiClient.get(`/user/academies/${academyId}/announcements`);
    return response.data;
  },

  getReviewsForAcademy: async (academyId: string): Promise<{ success: boolean; data: Review[] }> => {
    const response = await apiClient.get(`/user/academies/${academyId}/reviews`);
    return response.data;
  },

  // --- Child profiles ---
  createChildProfile: async (payload: {
    childName: string;
    childAge: number;
    motherName?: string;
    fatherName: string;
    fatherContact?: string;
    address?: string;
    city?: string;
  }): Promise<{ success: boolean; message: string; data: ChildProfile }> => {
    const response = await apiClient.post('/user/child-profiles', payload);
    return response.data;
  },

  getMyChildProfiles: async (): Promise<{ success: boolean; data: ChildProfile[] }> => {
    const response = await apiClient.get('/user/child-profiles');
    return response.data;
  },

  updateChildProfile: async (
    profileId: string,
    payload: Partial<{
      childName: string;
      childAge: number;
      motherName?: string;
      fatherName: string;
      fatherContact?: string;
      address?: string;
      city?: string;
    }>
  ): Promise<{ success: boolean; message: string; data: ChildProfile }> => {
    const response = await apiClient.put(`/user/child-profiles/${profileId}`, payload);
    return response.data;
  },

  deleteChildProfile: async (profileId: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete(`/user/child-profiles/${profileId}`);
    return response.data;
  },

  // --- Enrollment ---
  enrollChild: async (payload: {
    childProfileId: string;
    academyId: string;
  }): Promise<{ success: boolean; message: string; data: Enrollment }> => {
    const response = await apiClient.post('/user/enrollments', payload);
    return response.data;
  },

  getMyEnrollments: async (childProfileId?: string): Promise<{ success: boolean; data: Enrollment[] }> => {
    const response = await apiClient.get('/user/enrollments', {
      params: childProfileId ? { childProfileId } : undefined,
    });
    return response.data;
  },

  withdrawEnrollment: async (studentId: string): Promise<{ success: boolean; message: string; data: Enrollment }> => {
    const response = await apiClient.patch(`/user/enrollments/${studentId}/withdraw`);
    return response.data;
  },

  // --- Attendance / Certificates (parent-scoped reads) ---
  getChildAttendance: async (studentId: string): Promise<{ success: boolean; data: AttendanceRecord[] }> => {
    const response = await apiClient.get(`/user/students/${studentId}/attendance`);
    return response.data;
  },

  getChildCertificates: async (studentId: string): Promise<{ success: boolean; data: Certificate[] }> => {
    const response = await apiClient.get(`/user/students/${studentId}/certificates`);
    return response.data;
  },

  // --- Demo bookings ---
  createDemoBooking: async (payload: {
    childProfileId: string;
    academyId: string;
    bookingDate: string;
  }): Promise<{ success: boolean; message: string; data: DemoBooking }> => {
    const response = await apiClient.post('/user/demo-bookings', payload);
    return response.data;
  },

  getMyDemoBookings: async (): Promise<{ success: boolean; data: DemoBooking[] }> => {
    const response = await apiClient.get('/user/demo-bookings');
    return response.data;
  },

  cancelDemoBooking: async (bookingId: string): Promise<{ success: boolean; message: string; data: DemoBooking }> => {
    const response = await apiClient.patch(`/user/demo-bookings/${bookingId}/cancel`);
    return response.data;
  },

  // --- Reviews ---
  createReview: async (payload: {
    academyId: string;
    childProfileId: string;
    rating: number;
    title?: string;
    comment: string;
  }): Promise<{ success: boolean; message: string; data: Review }> => {
    const response = await apiClient.post('/user/reviews', payload);
    return response.data;
  },

  getMyReviews: async (): Promise<{ success: boolean; data: Review[] }> => {
    const response = await apiClient.get('/user/reviews/mine');
    return response.data;
  },
};
