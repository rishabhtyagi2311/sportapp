// @/services/auth/auth.ts
import * as FileSystem from 'expo-file-system/legacy';
import apiClient from '@/utils/apiClient';

export interface PartnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email?: string;
  city?: string;
  dob?: string;
  profileImage?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    partner: PartnerProfile;
  };
}

export interface MeResponse {
  success: boolean;
  message?: string;
  data: PartnerProfile;
}

export const authApiService = {
  register: async (payload: {
    firstName: string;
    lastName: string;
    contactNumber: string;
    password: string;
    email?: string;
    city?: string;
    dob?: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/partner/auth/register', payload);
    return response.data;
  },

  login: async (payload: { contactNumber: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/partner/auth/login', payload);
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get('/partner/auth/me');
    return response.data;
  },

  updateProfile: async (payload: {
    firstName?: string;
    lastName?: string;
    email?: string;
    city?: string;
    dob?: string;
    profileImage?: string;
  }): Promise<MeResponse> => {
    const response = await apiClient.put('/partner/auth/me', payload);
    return response.data;
  },

  // --- Storage (S3 upload) — no venueName/academyName means the backend
  // files it under the partner's own `profile/` folder.
  getPresignedUrl: async (fileName: string, fileType: string) => {
    const response = await apiClient.post('/partner/storage/presigned-url', { fileName, fileType });
    return response.data;
  },

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
};
