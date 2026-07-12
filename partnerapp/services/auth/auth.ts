// @/services/auth/auth.ts
import apiClient from '@/utils/apiClient';

export interface PartnerProfile {
  id: string;
  firstName: string;
  lastName: string;
  contactNumber: string;
  email?: string;
  city?: string;
  dob?: string;
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
};
