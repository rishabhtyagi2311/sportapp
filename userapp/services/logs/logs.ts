// @/services/logs/logs.ts
import apiClient from '@/utils/apiClient';
import { HealthEntry, NutritionEntry, WorkoutEntry } from '@/store/HealthLogStore';

export const logsApiService = {
  createWorkout: async (data: {
    date: string;
    type: 'Gym' | 'Home';
    split: string;
    exercises: { name: string; sets: string; reps: string }[];
  }): Promise<{ success: boolean; data: WorkoutEntry }> => {
    const response = await apiClient.post('/user/logs/workout', data);
    return response.data;
  },

  getMyWorkouts: async (): Promise<{ success: boolean; data: WorkoutEntry[] }> => {
    const response = await apiClient.get('/user/logs/workout/mine');
    return response.data;
  },

  createNutrition: async (data: {
    date: string;
    meals: { category: string; time: string; description: string }[];
  }): Promise<{ success: boolean; data: NutritionEntry }> => {
    const response = await apiClient.post('/user/logs/nutrition', data);
    return response.data;
  },

  getMyNutrition: async (): Promise<{ success: boolean; data: NutritionEntry[] }> => {
    const response = await apiClient.get('/user/logs/nutrition/mine');
    return response.data;
  },

  createHealth: async (data: {
    date: string;
    weight?: string;
    steps?: string;
    water?: string;
    energy?: 'Low' | 'Medium' | 'High';
    sleep?: number;
    motivation?: 'Low' | 'Medium' | 'High';
    measurements?: { [key: string]: string };
    photoUrl?: string;
  }): Promise<{ success: boolean; data: HealthEntry }> => {
    const response = await apiClient.post('/user/logs/health', data);
    return response.data;
  },

  getMyHealthLogs: async (): Promise<{ success: boolean; data: HealthEntry[] }> => {
    const response = await apiClient.get('/user/logs/health/mine');
    return response.data;
  },
};
