import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    partner?: {
        id: string;
    };
}
export declare const authenticatePartner: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map