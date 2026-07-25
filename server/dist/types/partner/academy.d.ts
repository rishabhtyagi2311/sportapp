import { z } from "zod";
export declare const createAcademySchema: z.ZodObject<{
    academyName: z.ZodString;
    sportType: z.ZodString;
    address: z.ZodString;
    city: z.ZodString;
    coachName: z.ZodString;
    contactNumber: z.ZodString;
    facilities: z.ZodString;
    fee: z.ZodNumber;
    feeStructure: z.ZodOptional<z.ZodEnum<{
        Monthly: "Monthly";
        Quarterly: "Quarterly";
        Yearly: "Yearly";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const updateAcademySchema: z.ZodObject<{
    academyName: z.ZodOptional<z.ZodString>;
    sportType: z.ZodOptional<z.ZodString>;
    address: z.ZodOptional<z.ZodString>;
    city: z.ZodOptional<z.ZodString>;
    coachName: z.ZodOptional<z.ZodString>;
    contactNumber: z.ZodOptional<z.ZodString>;
    facilities: z.ZodOptional<z.ZodString>;
    fee: z.ZodOptional<z.ZodNumber>;
    feeStructure: z.ZodOptional<z.ZodEnum<{
        Monthly: "Monthly";
        Quarterly: "Quarterly";
        Yearly: "Yearly";
    }>>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, z.core.$strip>;
export declare const addCoachSchema: z.ZodObject<{
    name: z.ZodString;
    specialization: z.ZodString;
    experience: z.ZodOptional<z.ZodString>;
    contact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const updateCoachSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    specialization: z.ZodOptional<z.ZodString>;
    experience: z.ZodOptional<z.ZodString>;
    contact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const addStudentSchema: z.ZodObject<{
    name: z.ZodString;
    age: z.ZodNumber;
    fatherName: z.ZodString;
    fatherContact: z.ZodString;
}, z.core.$strip>;
export declare const updateStudentSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    age: z.ZodOptional<z.ZodNumber>;
    fatherName: z.ZodOptional<z.ZodString>;
    fatherContact: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const markAttendanceSchema: z.ZodObject<{
    date: z.ZodString;
    present: z.ZodBoolean;
}, z.core.$strip>;
export declare const addPhotoSchema: z.ZodObject<{
    url: z.ZodString;
}, z.core.$strip>;
export declare const createCertificateSchema: z.ZodObject<{
    template: z.ZodString;
    achievement: z.ZodString;
}, z.core.$strip>;
export declare const createAnnouncementSchema: z.ZodObject<{
    content: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=academy.d.ts.map