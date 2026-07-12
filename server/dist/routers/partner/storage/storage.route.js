"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const s3Client_1 = require("../../../helpers/partner/s3Client");
const auth_middleware_1 = require("../../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
router.post('/storage/presigned-url', auth_middleware_1.authenticatePartner, s3Client_1.StorageController.getPresignedUrl);
exports.default = router;
//# sourceMappingURL=storage.route.js.map