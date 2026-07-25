import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma as globalClient } from "../../../index";

export class AuthService {
  private static signToken(partnerId: string): string {
    return jwt.sign({ id: partnerId, type: "partner" }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
    });
  }

  private static toPublicPartner(partner: {
    id: string;
    firstName: string;
    lastName: string;
    contactNumber: string;
    email?: string | null;
    city?: string | null;
    dob?: string | null;
    profileImage?: string | null;
  }) {
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

  static async register(data: {
    firstName: string;
    lastName: string;
    contactNumber: string;
    password: string;
    email?: string;
    city?: string;
    dob?: string;
  }) {
    const existing = await globalClient.partnerIdentity.findUnique({
      where: { contactNumber: data.contactNumber },
    });

    if (existing) {
      throw new Error("An account with this contact number already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const partner = await globalClient.partnerIdentity.create({
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

  static async getById(partnerId: string) {
    const partner = await globalClient.partnerIdentity.findUnique({ where: { id: partnerId } });

    if (!partner) {
      throw new Error("Partner not found");
    }

    return this.toPublicPartner(partner);
  }

  static async login(data: { contactNumber: string; password: string }) {
    const partner = await globalClient.partnerIdentity.findUnique({
      where: { contactNumber: data.contactNumber },
    });

    if (!partner) {
      throw new Error("Invalid contact number or password");
    }

    const isValid = await bcrypt.compare(data.password, partner.password);

    if (!isValid) {
      throw new Error("Invalid contact number or password");
    }

    const token = this.signToken(partner.id);

    return { token, partner: this.toPublicPartner(partner) };
  }

  static async updateProfile(
    partnerId: string,
    data: { firstName?: string; lastName?: string; email?: string; city?: string; dob?: string; profileImage?: string }
  ) {
    const existing = await globalClient.partnerIdentity.findUnique({ where: { id: partnerId } });

    if (!existing) {
      throw new Error("Partner not found");
    }

    const partner = await globalClient.partnerIdentity.update({
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
