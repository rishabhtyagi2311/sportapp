import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class UserBookingController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancel(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=booking.controller.d.ts.map