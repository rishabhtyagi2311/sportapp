import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
export declare class UserAcademyController {
    static list(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAnnouncements(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare class ChildProfileController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static list(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare class EnrollmentController {
    static create(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static list(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static withdraw(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
export declare class StudentRecordsController {
    static getAttendance(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getCertificates(req: UserAuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=academy.controller.d.ts.map