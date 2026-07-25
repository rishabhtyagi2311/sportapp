"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfileSchema = exports.userLoginSchema = exports.userRegisterSchema = void 0;
const zod_1 = require("zod");
exports.userRegisterSchema = zod_1.z.object({
    firstname: zod_1.z.string().min(1),
    lastname: zod_1.z.string().min(1),
    email: zod_1.z.string().email(),
    contact: zod_1.z.string().min(10),
    city: zod_1.z.string().min(1),
    dob: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
exports.userLoginSchema = zod_1.z.object({
    identifier: zod_1.z.string().min(1),
    password: zod_1.z.string().min(6),
});
exports.updateUserProfileSchema = zod_1.z.object({
    firstname: zod_1.z.string().min(1).optional(),
    lastname: zod_1.z.string().min(1).optional(),
    email: zod_1.z.string().email().optional(),
    city: zod_1.z.string().optional(),
    dob: zod_1.z.string().optional(),
});
//# sourceMappingURL=auth.js.map