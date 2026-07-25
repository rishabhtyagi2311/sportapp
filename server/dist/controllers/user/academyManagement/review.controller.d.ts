import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class ReviewController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listForAcademy(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=review.controller.d.ts.map