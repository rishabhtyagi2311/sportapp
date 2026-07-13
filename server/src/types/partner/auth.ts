import { z } from "zod";

export const partnerRegisterSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  contactNumber: z.string().min(10),
  password: z.string().min(6),
  email: z.string().email().optional(),
  city: z.string().optional(),
  dob: z.string().optional(),
});

export const partnerLoginSchema = z.object({
  contactNumber: z.string().min(10),
  password: z.string().min(6),
});

export const updatePartnerProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  email: z.string().email().optional(),
  city: z.string().optional(),
  dob: z.string().optional(),
});
