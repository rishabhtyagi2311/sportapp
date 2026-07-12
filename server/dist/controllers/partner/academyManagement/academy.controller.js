"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademyController = void 0;
const academy_1 = require("../../../services/partner/academyManagement/academy");
const academy_2 = require("../../../types/partner/academy");
class AcademyController {
    static async create(req, res) {
        try {
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.createAcademySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid academy data', error: parsed.error.issues });
            }
            const academy = await academy_1.AcademyService.createAcademy(parsed.data, partnerId);
            return res.status(201).json({ success: true, message: 'Academy registered successfully', data: academy });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error creating academy' });
        }
    }
    static async getMyAcademies(req, res) {
        try {
            const partnerId = req.partner?.id;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const academies = await academy_1.AcademyService.getAcademiesByPartner(partnerId);
            return res.status(200).json({ success: true, count: academies.length, data: academies });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching academies' });
        }
    }
    static async getById(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const academy = await academy_1.AcademyService.getAcademyById(academyId, partnerId);
            if (!academy) {
                return res.status(404).json({ success: false, message: 'Academy not found' });
            }
            return res.status(200).json({ success: true, data: academy });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching academy' });
        }
    }
    static async update(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.updateAcademySchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid academy data', error: parsed.error.issues });
            }
            const academy = await academy_1.AcademyService.updateAcademy(academyId, partnerId, parsed.data);
            return res.status(200).json({ success: true, message: 'Academy updated successfully', data: academy });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating academy' });
        }
    }
    static async remove(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await academy_1.AcademyService.deleteAcademy(academyId, partnerId);
            return res.status(200).json({ success: true, message: 'Academy deleted successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error deleting academy' });
        }
    }
    static async addCoach(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.addCoachSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid coach data', error: parsed.error.issues });
            }
            const coach = await academy_1.AcademyService.addCoach(academyId, partnerId, parsed.data);
            return res.status(201).json({ success: true, message: 'Coach added successfully', data: coach });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error adding coach' });
        }
    }
    static async updateCoach(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId, coachId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.updateCoachSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid coach data', error: parsed.error.issues });
            }
            const coach = await academy_1.AcademyService.updateCoach(academyId, partnerId, coachId, parsed.data);
            return res.status(200).json({ success: true, message: 'Coach updated successfully', data: coach });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating coach' });
        }
    }
    static async removeCoach(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId, coachId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await academy_1.AcademyService.removeCoach(academyId, partnerId, coachId);
            return res.status(200).json({ success: true, message: 'Coach removed successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error removing coach' });
        }
    }
    /* -------------------------------------------------------------- */
    /* STUDENTS                                                        */
    /* -------------------------------------------------------------- */
    static async addStudent(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.addStudentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid student data', error: parsed.error.issues });
            }
            const student = await academy_1.AcademyService.addStudent(academyId, partnerId, parsed.data);
            return res.status(201).json({ success: true, message: 'Student added successfully', data: student });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error adding student' });
        }
    }
    static async getStudents(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const students = await academy_1.AcademyService.getStudentsByAcademy(academyId, partnerId);
            return res.status(200).json({ success: true, data: students });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching students' });
        }
    }
    static async updateStudent(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId, studentId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.updateStudentSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid student data', error: parsed.error.issues });
            }
            const student = await academy_1.AcademyService.updateStudent(academyId, partnerId, studentId, parsed.data);
            return res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error updating student' });
        }
    }
    static async removeStudent(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId, studentId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await academy_1.AcademyService.deleteStudent(academyId, partnerId, studentId);
            return res.status(200).json({ success: true, message: 'Student removed successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error removing student' });
        }
    }
    /* -------------------------------------------------------------- */
    /* ATTENDANCE                                                      */
    /* -------------------------------------------------------------- */
    static async markAttendance(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { studentId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.markAttendanceSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid attendance data', error: parsed.error.issues });
            }
            const record = await academy_1.AcademyService.markAttendance(studentId, partnerId, parsed.data);
            return res.status(200).json({ success: true, data: record });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error marking attendance' });
        }
    }
    static async getAcademyAttendance(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            const { date } = req.query;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const records = await academy_1.AcademyService.getAttendanceForAcademy(academyId, partnerId, date);
            return res.status(200).json({ success: true, data: records });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching attendance' });
        }
    }
    static async getStudentAttendance(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { studentId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const records = await academy_1.AcademyService.getAttendanceForStudent(studentId, partnerId);
            return res.status(200).json({ success: true, data: records });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching attendance' });
        }
    }
    /* -------------------------------------------------------------- */
    /* PHOTOS                                                          */
    /* -------------------------------------------------------------- */
    static async addPhoto(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.addPhotoSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid photo data', error: parsed.error.issues });
            }
            const photo = await academy_1.AcademyService.addPhoto(academyId, partnerId, parsed.data.url);
            return res.status(201).json({ success: true, data: photo });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error adding photo' });
        }
    }
    static async getPhotos(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const photos = await academy_1.AcademyService.getPhotosByAcademy(academyId, partnerId);
            return res.status(200).json({ success: true, data: photos });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching photos' });
        }
    }
    static async removePhoto(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId, photoId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            await academy_1.AcademyService.removePhoto(academyId, partnerId, photoId);
            return res.status(200).json({ success: true, message: 'Photo removed successfully' });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error removing photo' });
        }
    }
    /* -------------------------------------------------------------- */
    /* CERTIFICATES                                                    */
    /* -------------------------------------------------------------- */
    static async createCertificate(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { studentId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const parsed = academy_2.createCertificateSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: 'Invalid certificate data', error: parsed.error.issues });
            }
            const certificate = await academy_1.AcademyService.createCertificate(studentId, partnerId, parsed.data);
            return res.status(201).json({ success: true, message: 'Certificate generated successfully', data: certificate });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error generating certificate' });
        }
    }
    static async getAcademyCertificates(req, res) {
        try {
            const partnerId = req.partner?.id;
            const { academyId } = req.params;
            if (!partnerId) {
                return res.status(401).json({ success: false, message: 'Unauthorized' });
            }
            const certificates = await academy_1.AcademyService.getCertificatesByAcademy(academyId, partnerId);
            return res.status(200).json({ success: true, data: certificates });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || 'Error fetching certificates' });
        }
    }
}
exports.AcademyController = AcademyController;
//# sourceMappingURL=academy.controller.js.map