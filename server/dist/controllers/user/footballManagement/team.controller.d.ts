import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class FootballTeamController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static mine(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static players(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static all(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static addMember(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=team.controller.d.ts.map