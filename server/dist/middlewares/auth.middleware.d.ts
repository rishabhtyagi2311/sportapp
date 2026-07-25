import { Request, Response, NextFunction } from 'express';
export interface AuthRequest extends Request {
    partner?: {
        id: string;
    };
}
export interface UserAuthRequest extends Request {
    user?: {
        id: number;
    };
}
export declare const authenticatePartner: (req: AuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export declare const authenticateUser: (req: UserAuthRequest, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=auth.middleware.d.ts.map