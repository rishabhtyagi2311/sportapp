import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class UserAuthController {
    static register(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static login(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static me(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateProfile(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=auth.controller.d.ts.map