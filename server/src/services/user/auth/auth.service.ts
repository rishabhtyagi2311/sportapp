import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma as globalClient } from "../../../index";

export class UserAuthService {
  private static signToken(userId: number): string {
    return jwt.sign({ id: userId, type: "user" }, process.env.JWT_SECRET as string, {
      expiresIn: (process.env.JWT_EXPIRES_IN || "7d") as any,
    });
  }

  private static toPublicUser(user: {
    id: number;
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    city: string;
    dob: string;
  }) {
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

  static async register(data: {
    firstname: string;
    lastname: string;
    email: string;
    contact: string;
    city: string;
    dob: string;
    password: string;
  }) {
    const existing = await globalClient.userInfo.findFirst({
      where: { OR: [{ email: data.email }, { contact: data.contact }] },
    });

    if (existing) {
      throw new Error("An account with this email or contact number already exists");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await globalClient.userInfo.create({
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

  static async getById(userId: number) {
    const user = await globalClient.userInfo.findUnique({ where: { id: userId } });

    if (!user) {
      throw new Error("User not found");
    }

    return this.toPublicUser(user);
  }

  static async login(data: { identifier: string; password: string }) {
    const user = await globalClient.userInfo.findFirst({
      where: { OR: [{ email: data.identifier }, { contact: data.identifier }] },
    });

    if (!user) {
      throw new Error("Invalid email/contact or password");
    }

    const isValid = await bcrypt.compare(data.password, user.password);

    if (!isValid) {
      throw new Error("Invalid email/contact or password");
    }

    const token = this.signToken(user.id);

    return { token, user: this.toPublicUser(user) };
  }

  static async updateProfile(
    userId: number,
    data: { firstname?: string; lastname?: string; email?: string; city?: string; dob?: string }
  ) {
    const existing = await globalClient.userInfo.findUnique({ where: { id: userId } });

    if (!existing) {
      throw new Error("User not found");
    }

    const user = await globalClient.userInfo.update({
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
