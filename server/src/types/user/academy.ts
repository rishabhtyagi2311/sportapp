import { z } from "zod";

export const publicAcademyFiltersSchema = z.object({
  city: z.string().optional(),
  sportType: z.string().optional(),
});

export const createChildProfileSchema = z.object({
  childName: z.string().min(1),
  childAge: z.number().int().positive(),
  motherName: z.string().optional(),
  fatherName: z.string().min(1),
  fatherContact: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
});

export const updateChildProfileSchema = createChildProfileSchema.partial();

export const enrollChildSchema = z.object({
  childProfileId: z.string().min(1),
  academyId: z.string().min(1),
});

export const createDemoBookingSchema = z.object({
  childProfileId: z.string().min(1),
  academyId: z.string().min(1),
  bookingDate: z.string().min(1),
});

export const createReviewSchema = z.object({
  academyId: z.string().min(1),
  childProfileId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().min(1),
});
