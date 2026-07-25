import { z } from "zod";
export declare const partnerRegisterSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    contactNumber: z.ZodString;
    password: z.ZodString;
    email: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const partnerLoginSchema: z.ZodObject<{
    contactNumber: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updatePartnerProfileSchema: z.ZodObject<{
    firstName: z.ZodOptional<z.ZodString>;
    lastName: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
    profileImage: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=auth.d.ts.map