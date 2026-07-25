import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class FootballProfileController {
    static register(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static check(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=profile.controller.d.ts.map