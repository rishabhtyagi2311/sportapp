import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class MatchController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static start(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static abandon(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static addEvent(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updatePossession(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static end(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static teamMatches(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static playerStats(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=match.controller.d.ts.map