import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class UserDemoBookingController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static list(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancel(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=demoBooking.controller.d.ts.map