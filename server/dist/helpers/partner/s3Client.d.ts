import { Response } from 'express';
import { AuthRequest } from '../../middlewares/auth.middleware';
export declare class StorageController {
    static getPresignedUrl(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
}
//# sourceMappingURL=s3Client.d.ts.map