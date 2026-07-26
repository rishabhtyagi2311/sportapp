import { z } from "zod";

export const exerciseSchema = z.object({
  name: z.string().min(1),
  sets: z.string(),
  reps: z.string(),
});

export const createWorkoutLogSchema = z.object({
  date: z.string().min(1),
  type: z.enum(["Gym", "Home"]),
  split: z.string().min(1),
  exercises: z.array(exerciseSchema),
});

export const mealSchema = z.object({
  category: z.string().min(1),
  time: z.string().optional().default(""),
  description: z.string().min(1),
});

export const createNutritionLogSchema = z.object({
  date: z.string().min(1),
  meals: z.array(mealSchema),
});

export const createHealthLogSchema = z.object({
  date: z.string().min(1),
  weight: z.string().optional(),
  steps: z.string().optional(),
  water: z.string().optional(),
  energy: z.enum(["Low", "Medium", "High"]).optional(),
  sleep: z.number().int().nonnegative().optional(),
  motivation: z.enum(["Low", "Medium", "High"]).optional(),
  measurements: z.record(z.string(), z.string()).optional(),
  photoUrl: z.string().url().optional(),
});
