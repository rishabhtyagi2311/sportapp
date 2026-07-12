import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
export declare class VenueController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMyVenues(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=venue.controller.d.ts.map