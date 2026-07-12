import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
export declare class AcademyController {
    static create(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getMyAcademies(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getById(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static update(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static remove(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static addCoach(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateCoach(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeCoach(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static addStudent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStudents(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static updateStudent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static removeStudent(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static markAttendance(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAcademyAttendance(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getStudentAttendance(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static addPhoto(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getPhotos(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static removePhoto(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static createCertificate(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
    static getAcademyCertificates(req: AuthRequest, res: Response): Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=academy.controller.d.ts.map