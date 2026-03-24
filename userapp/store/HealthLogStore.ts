import { create } from 'zustand';

// --- Existing Nutrition & Health Types ---
export interface Meal { category: string; time: string; description: string; }
export interface NutritionEntry {  date: string; meals: Meal[]; }

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
}

// --- NEW: Workout Types ---
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
  workoutHistory: WorkoutEntry[]; // New
  addEntry: (entry: HealthEntry) => void;
  addNutritionEntry: (entry: NutritionEntry) => void;
  addWorkoutEntry: (entry: WorkoutEntry) => void; // New
}

export const useHealthStore = create<HealthState>((set) => ({
  history: [],
  nutritionHistory: [],
  workoutHistory: [],
  addEntry: (entry) => set((state) => ({ history: [entry, ...state.history] })),
  addNutritionEntry: (entry) => set((state) => ({ nutritionHistory: [entry, ...state.nutritionHistory] })),
  addWorkoutEntry: (entry) => set((state) => ({ workoutHistory: [entry, ...state.workoutHistory] })),
}));