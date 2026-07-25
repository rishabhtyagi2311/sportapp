import { z } from "zod";
export declare const userRegisterSchema: z.ZodObject<{
    firstname: z.ZodString;
    lastname: z.ZodString;
    email: z.ZodString;
    contact: z.ZodString;
    city: z.ZodString;
    dob: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const userLoginSchema: z.ZodObject<{
    identifier: z.ZodString;
    password: z.ZodString;
}, z.core.$strip>;
export declare const updateUserProfileSchema: z.ZodObject<{
    firstname: z.ZodOptional<z.ZodString>;
    lastname: z.ZodOptional<z.ZodString>;
    email: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    dob: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
//# sourceMappingURL=auth.d.ts.map