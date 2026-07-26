import { Response } from "express";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { prisma } from "../../../index";

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = new S3Client({
      region: process.env.AWS_REGION!,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }
  return s3Client;
}

function slugify(value: string, fallback: string): string {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || fallback
  );
}

export class UserStorageController {
  static async getPresignedUrl(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { fileName, fileType } = req.body;
      if (!fileName || !fileType) {
        return res.status(400).json({ success: false, message: "fileName and fileType are required" });
      }

      const user = await prisma.userInfo.findUnique({ where: { id: userId } });
      const userSlug = user
        ? `${slugify(`${user.firstname} ${user.lastname}`, "user")}-${userId}`
        : String(userId);

      const fileKey = `user/${userSlug}/HealthLog/photos/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
      const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      return res.status(200).json({ success: true, data: { uploadUrl, publicUrl } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Could not generate upload URL" });
    }
  }
}
