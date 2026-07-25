"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const index_1 = require("../../../index");
class AuthService {
    static signToken(partnerId) {
        return jsonwebtoken_1.default.sign({ id: partnerId, type: "partner" }, process.env.JWT_SECRET, {
            expiresIn: (process.env.JWT_EXPIRES_IN || "7d"),
        });
    }
    static toPublicPartner(partner) {
        return {
            id: partner.id,
            firstName: partner.firstName,
            lastName: partner.lastName,
            contactNumber: partner.contactNumber,
            email: partner.email || undefined,
            city: partner.city || undefined,
            dob: partner.dob || undefined,
            profileImage: partner.profileImage || undefined,
        };
    }
    static async register(data) {
        const existing = await index_1.prisma.partnerIdentity.findUnique({
            where: { contactNumber: data.contactNumber },
        });
        if (existing) {
            throw new Error("An account with this contact number already exists");
        }
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 10);
        const partner = await index_1.prisma.partnerIdentity.create({
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                contactNumber: data.contactNumber,
                password: hashedPassword,
                email: data.email,
                city: data.city,
                dob: data.dob,
            },
        });
        const token = this.signToken(partner.id);
        return { token, partner: this.toPublicPartner(partner) };
    }
    static async getById(partnerId) {
        const partner = await index_1.prisma.partnerIdentity.findUnique({ where: { id: partnerId } });
        if (!partner) {
            throw new Error("Partner not found");
        }
        return this.toPublicPartner(partner);
    }
    static async login(data) {
        const partner = await index_1.prisma.partnerIdentity.findUnique({
            where: { contactNumber: data.contactNumber },
        });
        if (!partner) {
            throw new Error("Invalid contact number or password");
        }
        const isValid = await bcryptjs_1.default.compare(data.password, partner.password);
        if (!isValid) {
            throw new Error("Invalid contact number or password");
        }
        const token = this.signToken(partner.id);
        return { token, partner: this.toPublicPartner(partner) };
    }
    static async updateProfile(partnerId, data) {
        const existing = await index_1.prisma.partnerIdentity.findUnique({ where: { id: partnerId } });
        if (!existing) {
            throw new Error("Partner not found");
        }
        const partner = await index_1.prisma.partnerIdentity.update({
            where: { id: partnerId },
            data: {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                city: data.city,
                dob: data.dob,
                profileImage: data.profileImage,
            },
        });
        return this.toPublicPartner(partner);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map