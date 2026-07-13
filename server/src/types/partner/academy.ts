import { z } from "zod";

export const createAcademySchema = z.object({
  academyName: z.string().min(3),
  sportType: z.string().min(1),
  address: z.string().min(1),
  city: z.string().min(1),
  coachName: z.string().min(1),
  contactNumber: z.string().min(10),
  facilities: z.string(),
  fee: z.number().nonnegative(),
  feeStructure: z.enum(["Monthly", "Quarterly", "Yearly"]).optional(),
  isActive: z.boolean().optional(),
});

export const updateAcademySchema = z.object({
  academyName: z.string().min(3).optional(),
  sportType: z.string().min(1).optional(),
  address: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
  coachName: z.string().min(1).optional(),
  contactNumber: z.string().min(10).optional(),
  facilities: z.string().optional(),
  fee: z.number().nonnegative().optional(),
  feeStructure: z.enum(["Monthly", "Quarterly", "Yearly"]).optional(),
  isActive: z.boolean().optional(),
});

export const addCoachSchema = z.object({
  name: z.string().min(1),
  specialization: z.string().min(1),
  experience: z.string().optional(),
  contact: z.string().optional(),
});

export const updateCoachSchema = z.object({
  name: z.string().min(1).optional(),
  specialization: z.string().min(1).optional(),
  experience: z.string().optional(),
  contact: z.string().optional(),
});

export const addStudentSchema = z.object({
  name: z.string().min(1),
  age: z.number().int().positive(),
  fatherName: z.string().min(1),
  fatherContact: z.string().min(10),
});

export const updateStudentSchema = z.object({
  name: z.string().min(1).optional(),
  age: z.number().int().positive().optional(),
  fatherName: z.string().min(1).optional(),
  fatherContact: z.string().min(10).optional(),
});

export const markAttendanceSchema = z.object({
  date: z.string(),
  present: z.boolean(),
});

export const addPhotoSchema = z.object({
  url: z.string().min(1),
});

export const createCertificateSchema = z.object({
  template: z.string().min(1),
  achievement: z.string().min(1),
});

export const createAnnouncementSchema = z.object({
  content: z.string().min(1).max(1000),
});
