import { Router } from 'express';
import { StorageController } from '../../../helpers/partner/s3Client';
import { authenticatePartner } from '../../../middlewares/auth.middleware';

const router = Router();

router.post('/storage/presigned-url', authenticatePartner, StorageController.getPresignedUrl);

export default router;
