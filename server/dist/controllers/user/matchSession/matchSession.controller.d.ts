import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class UserMatchSessionController {
    static list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static join(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static leave(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=matchSession.controller.d.ts.map