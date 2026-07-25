import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class EventRegistrationController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static listForEvent(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static process(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=registration.controller.d.ts.map