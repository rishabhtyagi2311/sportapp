import { create } from 'zustand';
import { logsApiService } from '@/services/logs/logs';

// --- Nutrition & Health Types ---
export interface Meal { category: string; time: string; description: string; }
export interface NutritionEntry { id: string; date: string; meals: Meal[]; }

export interface HealthEntry {
  id: string;
  date: string;
  weight: string;
  steps: string;
  water: string;
  energy: 'Low' | 'Medium' | 'High';
  sleep: number;
  motivation: 'Low' | 'Medium' | 'High';
  measurements: { [key: string]: string };
  photoUrl?: string;
}

// --- Workout Types ---
export interface Exercise {
  name: string;
  sets: string;
  reps: string;
}

export interface WorkoutEntry {
  id: string;
  date: string;
  type: 'Gym' | 'Home';
  split: string;
  exercises: Exercise[];
}

interface HealthState {
  history: HealthEntry[];
  nutritionHistory: NutritionEntry[];
  workoutHistory: WorkoutEntry[];
  isLoading: boolean;
  error: string | null;

  addEntry: (entry: Omit<HealthEntry, 'id'>) => Promise<void>;
  addNutritionEntry: (entry: Omit<NutritionEntry, 'id'>) => Promise<void>;
  addWorkoutEntry: (entry: Omit<WorkoutEntry, 'id'>) => Promise<void>;

  fetchHealthHistory: () => Promise<void>;
  fetchNutritionHistory: () => Promise<void>;
  fetchWorkoutHistory: () => Promise<void>;
}

export const useHealthStore = create<HealthState>((set) => ({
  history: [],
  nutritionHistory: [],
  workoutHistory: [],
  isLoading: false,
  error: null,

  addEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.createHealth(entry);
      set((state) => ({ history: [response.data, ...state.history], isLoading: false }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not save health log';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  addNutritionEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.createNutrition(entry);
      set((state) => ({ nutritionHistory: [response.data, ...state.nutritionHistory], isLoading: false }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not save nutrition log';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  addWorkoutEntry: async (entry) => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.createWorkout(entry);
      set((state) => ({ workoutHistory: [response.data, ...state.workoutHistory], isLoading: false }));
    } catch (err: any) {
      const message = err.response?.data?.message || 'Could not save workout log';
      set({ error: message, isLoading: false });
      throw new Error(message);
    }
  },

  fetchHealthHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.getMyHealthLogs();
      set({ history: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load health history', isLoading: false });
    }
  },

  fetchNutritionHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.getMyNutrition();
      set({ nutritionHistory: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load nutrition history', isLoading: false });
    }
  },

  fetchWorkoutHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await logsApiService.getMyWorkouts();
      set({ workoutHistory: response.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || 'Could not load workout history', isLoading: false });
    }
  },
}));
