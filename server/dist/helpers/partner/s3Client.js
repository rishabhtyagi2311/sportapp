"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
let s3Client = null;
function getS3Client() {
    if (!s3Client) {
        s3Client = new client_s3_1.S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
}
function slugify(value, fallback) {
    return value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || fallback;
}
class StorageController {
    static async getPresignedUrl(req, res) {
        try {
            const { fileName, fileType, venueName, academyName } = req.body;
            const fileKey = academyName
                ? `partner/Academies/${slugify(academyName, 'untitled-academy')}/photos/${Date.now()}-${fileName}`
                : `partner/Venues/${slugify(venueName, 'untitled-venue')}/images/${Date.now()}-${fileName}`;
            const command = new client_s3_1.PutObjectCommand({
                Bucket: process.env.AWS_BUCKET_NAME,
                Key: fileKey,
                ContentType: fileType,
            });
            const uploadUrl = await (0, s3_request_presigner_1.getSignedUrl)(getS3Client(), command, { expiresIn: 300 });
            const publicUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
            res.json({ uploadUrl, publicUrl });
        }
        catch (error) {
            res.status(500).json({ error: "Could not generate upload URL" });
        }
    }
}
exports.StorageController = StorageController;
//# sourceMappingURL=s3Client.js.map