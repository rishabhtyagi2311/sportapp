"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createAnnouncementSchema = exports.createCertificateSchema = exports.addPhotoSchema = exports.markAttendanceSchema = exports.updateStudentSchema = exports.addStudentSchema = exports.updateCoachSchema = exports.addCoachSchema = exports.updateAcademySchema = exports.createAcademySchema = void 0;
const zod_1 = require("zod");
exports.createAcademySchema = zod_1.z.object({
    academyName: zod_1.z.string().min(3),
    sportType: zod_1.z.string().min(1),
    address: zod_1.z.string().min(1),
    city: zod_1.z.string().min(1),
    coachName: zod_1.z.string().min(1),
    contactNumber: zod_1.z.string().min(10),
    facilities: zod_1.z.string(),
    fee: zod_1.z.number().nonnegative(),
    feeStructure: zod_1.z.enum(["Monthly", "Quarterly", "Yearly"]).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.updateAcademySchema = zod_1.z.object({
    academyName: zod_1.z.string().min(3).optional(),
    sportType: zod_1.z.string().min(1).optional(),
    address: zod_1.z.string().min(1).optional(),
    city: zod_1.z.string().min(1).optional(),
    coachName: zod_1.z.string().min(1).optional(),
    contactNumber: zod_1.z.string().min(10).optional(),
    facilities: zod_1.z.string().optional(),
    fee: zod_1.z.number().nonnegative().optional(),
    feeStructure: zod_1.z.enum(["Monthly", "Quarterly", "Yearly"]).optional(),
    isActive: zod_1.z.boolean().optional(),
});
exports.addCoachSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    specialization: zod_1.z.string().min(1),
    experience: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
});
exports.updateCoachSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    specialization: zod_1.z.string().min(1).optional(),
    experience: zod_1.z.string().optional(),
    contact: zod_1.z.string().optional(),
});
exports.addStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1),
    age: zod_1.z.number().int().positive(),
    fatherName: zod_1.z.string().min(1),
    fatherContact: zod_1.z.string().min(10),
});
exports.updateStudentSchema = zod_1.z.object({
    name: zod_1.z.string().min(1).optional(),
    age: zod_1.z.number().int().positive().optional(),
    fatherName: zod_1.z.string().min(1).optional(),
    fatherContact: zod_1.z.string().min(10).optional(),
});
exports.markAttendanceSchema = zod_1.z.object({
    date: zod_1.z.string(),
    present: zod_1.z.boolean(),
});
exports.addPhotoSchema = zod_1.z.object({
    url: zod_1.z.string().min(1),
});
exports.createCertificateSchema = zod_1.z.object({
    template: zod_1.z.string().min(1),
    achievement: zod_1.z.string().min(1),
});
exports.createAnnouncementSchema = zod_1.z.object({
    content: zod_1.z.string().min(1).max(1000),
});
//# sourceMappingURL=academy.js.map