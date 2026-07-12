"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partnerLoginSchema = exports.partnerRegisterSchema = void 0;
const zod_1 = require("zod");
exports.partnerRegisterSchema = zod_1.z.object({
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
    contactNumber: zod_1.z.string().min(10),
    password: zod_1.z.string().min(6),
    email: zod_1.z.string().email().optional(),
    city: zod_1.z.string().optional(),
    dob: zod_1.z.string().optional(),
});
exports.partnerLoginSchema = zod_1.z.object({
    contactNumber: zod_1.z.string().min(10),
    password: zod_1.z.string().min(6),
});
//# sourceMappingURL=auth.js.map