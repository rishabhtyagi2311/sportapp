import { Request, Response } from 'express';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

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
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || fallback;
}

export class StorageController {
  static async getPresignedUrl(req: Request, res: Response) {
    try {
      const { fileName, fileType, venueName, academyName } = req.body;

      const fileKey = academyName
        ? `partner/Academies/${slugify(academyName, 'untitled-academy')}/photos/${Date.now()}-${fileName}`
        : `partner/Venues/${slugify(venueName, 'untitled-venue')}/images/${Date.now()}-${fileName}`;

      const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: fileKey,
        ContentType: fileType,
      });

      const uploadUrl = await getSignedUrl(getS3Client(), command, { expiresIn: 300 });
      const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;

      res.json({ uploadUrl, publicUrl });
    } catch (error) {
      res.status(500).json({ error: "Could not generate upload URL" });
    }
  }
}