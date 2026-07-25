import { z } from "zod";
export declare const publicAcademyFiltersSchema: z.ZodObject<{
    city: z.ZodOptional<z.ZodString>;
    sportType: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const createChildProfileSchema: z.ZodObject<{
    childName: z.ZodString;
    childAge: z.ZodNumber;
    motherName: z.ZodOptional<z.ZodString>;
    fatherName: z.ZodString;
    fatherContact: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateChildProfileSchema: z.ZodObject<{
    childName: z.ZodOptional<z.ZodString>;
    childAge: z.ZodOptional<z.ZodNumber>;
    motherName: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    fatherName: z.ZodOptional<z.ZodString>;
    fatherContact: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    address: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    city: z.ZodOptional<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export declare const enrollChildSchema: z.ZodObject<{
    childProfileId: z.ZodString;
    academyId: z.ZodString;
}, z.core.$strip>;
export declare const createDemoBookingSchema: z.ZodObject<{
    childProfileId: z.ZodString;
    academyId: z.ZodString;
    bookingDate: z.ZodString;
}, z.core.$strip>;
export declare const createReviewSchema: z.ZodObject<{
    academyId: z.ZodString;
    childProfileId: z.ZodString;
    rating: z.ZodNumber;
    title: z.ZodOptional<z.ZodString>;
    comment: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=academy.d.ts.map