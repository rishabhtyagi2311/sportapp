// @/services/auth/auth.ts
import apiClient from '@/utils/apiClient';

export interface UserProfile {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  contact: string;
  city: string;
  dob: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface MeResponse {
  success: boolean;
  message?: string;
  data: UserProfile;
}

export const authApiService = {
  register: async (payload: {
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    city: string;
    dob: string;
    password: string;
  }): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/auth/register', payload);
    return response.data;
  },

  login: async (payload: { identifier: string; password: string }): Promise<AuthResponse> => {
    const response = await apiClient.post('/user/auth/login', payload);
    return response.data;
  },

  getMe: async (): Promise<MeResponse> => {
    const response = await apiClient.get('/user/auth/me');
    return response.data;
  },

  updateProfile: async (payload: {
    firstname?: string;
    lastname?: string;
    email?: string;
    city?: string;
    dob?: string;
  }): Promise<MeResponse> => {
    const response = await apiClient.put('/user/auth/me', payload);
    return response.data;
  },
};
