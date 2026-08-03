import { z } from "zod";

const coordinatesSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

const addressSchema = z.object({
  street: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  coordinates: coordinatesSchema.optional(),
});

const contactInfoSchema = z.object({
  phone: z.string(),
  email: z.string().optional(),
  whatsapp: z.string().optional(),
});

const operatingDaySchema = z.object({
  open: z.string(),
  close: z.string(),
  isOpen: z.boolean(),
});

const operatingHoursSchema = z.object({
  monday: operatingDaySchema,
  tuesday: operatingDaySchema,
  wednesday: operatingDaySchema,
  thursday: operatingDaySchema,
  friday: operatingDaySchema,
  saturday: operatingDaySchema,
  sunday: operatingDaySchema,
});

const peakPricingSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string(),
  endTime: z.string(),
  price: z.number().nonnegative(),
});

export const createVenueSchema = z.object({
  name: z.string().min(3),
  description: z.string(),
  address: addressSchema,
  contactInfo: contactInfoSchema,
  operatingHours: operatingHoursSchema,
  peakPricing: peakPricingSchema.optional(),
  sports: z.array(z.any()),
  amenities: z.array(z.any()),
  images: z.array(z.string()),
  coverImageUrl: z.string().optional(),
  timeSlots: z.array(z.any()),
  isActive: z.boolean().optional(),
});

export const updateVenueSchema = z.object({
  name: z.string().min(3).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  address: addressSchema.partial().optional(),
  contactInfo: contactInfoSchema.optional(),
  operatingHours: operatingHoursSchema.optional(),
  peakPricing: peakPricingSchema.optional(),
  sports: z.array(z.any()).optional(),
  amenities: z.array(z.any()).optional(),
  images: z.array(z.string()).optional(),
  coverImageUrl: z.string().nullable().optional(),
});
