import { z } from "zod";

export const userRegisterSchema = z.object({
  firstname: z.string().min(1),
  lastname: z.string().min(1),
  email: z.string().email(),
  contact: z.string().min(10),
  city: z.string().min(1),
  dob: z.string().min(1),
  password: z.string().min(6),
});

export const userLoginSchema = z.object({
  identifier: z.string().min(1),
  password: z.string().min(6),
});

export const updateUserProfileSchema = z.object({
  firstname: z.string().min(1).optional(),
  lastname: z.string().min(1).optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  dob: z.string().optional(),
});
