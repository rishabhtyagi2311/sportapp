"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StorageController = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const index_1 = require("../../index");
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
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(401).json({ error: "Unauthorized" });
            }
            const { fileName, fileType, venueName, academyName } = req.body;
            const partner = await index_1.prisma.partnerIdentity.findUnique({ where: { id: partnerId } });
            const partnerSlug = partner
                ? `${slugify(`${partner.firstName} ${partner.lastName}`, 'partner')}-${partnerId.slice(0, 6)}`
                : partnerId.slice(0, 8);
            const fileKey = academyName
                ? `partner/${partnerSlug}/Academies/${slugify(academyName, 'untitled-academy')}/photos/${Date.now()}-${fileName}`
                : venueName
                    ? `partner/${partnerSlug}/Venues/${slugify(venueName, 'untitled-venue')}/images/${Date.now()}-${fileName}`
                    : `partner/${partnerSlug}/profile/${Date.now()}-${fileName}`;
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