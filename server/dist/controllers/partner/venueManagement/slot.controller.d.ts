import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
export declare class SlotController {
    static getSlots(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static generateSlots(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateSlot(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static createBlock(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeBlock(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getBookings(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancelBooking(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static createMatchSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMatchSessions(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static cancelMatchSession(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateMatchSessionStatus(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=slot.controller.d.ts.map