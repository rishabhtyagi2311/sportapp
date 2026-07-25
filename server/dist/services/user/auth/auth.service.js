"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../../index");
class UserAuthService {
    static signToken(userId) {
        return jsonwebtoken_1.default.sign({ id: userId, type: "user" }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
        });
    }
    static toPublicUser(user) {
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            email: user.email,
            contact: user.contact,
            city: user.city,
            dob: user.dob,
        };
    }
    static async register(data) {
        const existing = await index_1.prisma.userInfo.findFirst({
            where: { OR: [{ email: data.email }, { contact: data.contact }] },
        });
        if (existing) {
            throw new Error("An account with this email or contact number already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const user = await index_1.prisma.userInfo.create({
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                contact: data.contact,
                city: data.city,
                dob: data.dob,
                password: hashedPassword,
            },
        });
        const token = this.signToken(user.id);
        return { token, user: this.toPublicUser(user) };
    }
    static async getById(userId) {
        const user = await index_1.prisma.userInfo.findUnique({ where: { id: userId } });
        if (!user) {
            throw new Error("User not found");
        }
        return this.toPublicUser(user);
    }
    static async login(data) {
        const user = await index_1.prisma.userInfo.findFirst({
            where: { OR: [{ email: data.identifier }, { contact: data.identifier }] },
        });
        if (!user) {
            throw new Error("Invalid email/contact or password");
        }
        const isValid = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValid) {
            throw new Error("Invalid email/contact or password");
        }
        const token = this.signToken(user.id);
        return { token, user: this.toPublicUser(user) };
    }
    static async updateProfile(userId, data) {
        const existing = await index_1.prisma.userInfo.findUnique({ where: { id: userId } });
        if (!existing) {
            throw new Error("User not found");
        }
        const user = await index_1.prisma.userInfo.update({
            where: { id: userId },
            data: {
                firstname: data.firstname,
                lastname: data.lastname,
                email: data.email,
                city: data.city,
                dob: data.dob,
            },
        });
        return this.toPublicUser(user);
    }
}
exports.UserAuthService = UserAuthService;
//# sourceMappingURL=auth.service.js.map