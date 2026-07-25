import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class TournamentController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static start(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static startFixtureMatch(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=tournament.controller.d.ts.map