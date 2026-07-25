"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRecordsController = exports.EnrollmentController = exports.ChildProfileController = exports.UserAcademyController = void 0;
const academy_1 = require("../../../services/partner/academyManagement/academy");
const childProfile_1 = require("../../../services/user/academyManagement/childProfile");
const enrollment_1 = require("../../../services/user/academyManagement/enrollment");
const studentRecords_1 = require("../../../services/user/academyManagement/studentRecords");
const academy_2 = require("../../../types/user/academy");
class UserAcademyController {
    static async list(req, res) {
        try {
            const parsed = academy_2.publicAcademyFiltersSchema.safeParse(req.query);
            const filters = parsed.success ? parsed.data : {};
            const academies = await academy_1.AcademyService.getPublicAcademies(filters);
            return res.status(200).json({ success: true, count: academies.length, data: academies });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching academies" });
        }
    }
    static async getById(req, res) {
        try {
            const { academyId } = req.params;
            const academy = await academy_1.AcademyService.getPublicAcademyById(academyId);
            if (!academy) {
                return res.status(404).json({ success: false, message: "Academy not found" });
            }
            return res.status(200).json({ success: true, data: academy });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching academy" });
        }
    }
    static async getAnnouncements(req, res) {
        try {
            const { academyId } = req.params;
            const announcements = await academy_1.AcademyService.getPublicAnnouncements(academyId);
            return res.status(200).json({ success: true, data: announcements });
        }
        catch (error) {
            return res.status(404).json({ success: false, message: error.message || "Error fetching announcements" });
        }
    }
}
exports.UserAcademyController = UserAcademyController;
class ChildProfileController {
    static async create(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = academy_2.createChildProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid child profile data", error: parsed.error.issues });
            }
            const profile = await childProfile_1.ChildProfileService.createChildProfile(parentId, parsed.data);
            return res.status(201).json({ success: true, message: "Child profile created", data: profile });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error creating child profile" });
        }
    }
    static async list(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const profiles = await childProfile_1.ChildProfileService.getMyChildProfiles(parentId);
            return res.status(200).json({ success: true, data: profiles });
        }
        catch (error) {
            return res.status(500).json({ success: false, message: error.message || "Error fetching child profiles" });
        }
    }
    static async update(req, res) {
        try {
            const parentId = req.user?.id;
            const { profileId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = academy_2.updateChildProfileSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid child profile data", error: parsed.error.issues });
            }
            const profile = await childProfile_1.ChildProfileService.updateChildProfile(parentId, profileId, parsed.data);
            return res.status(200).json({ success: true, message: "Child profile updated", data: profile });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error updating child profile" });
        }
    }
    static async remove(req, res) {
        try {
            const parentId = req.user?.id;
            const { profileId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            await childProfile_1.ChildProfileService.deleteChildProfile(parentId, profileId);
            return res.status(200).json({ success: true, message: "Child profile deleted" });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error deleting child profile" });
        }
    }
}
exports.ChildProfileController = ChildProfileController;
class EnrollmentController {
    static async create(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const parsed = academy_2.enrollChildSchema.safeParse(req.body);
            if (!parsed.success) {
                return res.status(400).json({ success: false, message: "Invalid enrollment data", error: parsed.error.issues });
            }
            const enrollment = await enrollment_1.EnrollmentService.enrollChild(parentId, parsed.data);
            return res.status(201).json({ success: true, message: "Enrolled successfully", data: enrollment });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error enrolling child" });
        }
    }
    static async list(req, res) {
        try {
            const parentId = req.user?.id;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const { childProfileId } = req.query;
            const enrollments = childProfileId
                ? await enrollment_1.EnrollmentService.getEnrollmentsForChild(parentId, childProfileId)
                : await enrollment_1.EnrollmentService.getMyEnrollments(parentId);
            return res.status(200).json({ success: true, data: enrollments });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error fetching enrollments" });
        }
    }
    static async withdraw(req, res) {
        try {
            const parentId = req.user?.id;
            const { studentId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const enrollment = await enrollment_1.EnrollmentService.withdrawEnrollment(parentId, studentId);
            return res.status(200).json({ success: true, message: "Enrollment withdrawn", data: enrollment });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error withdrawing enrollment" });
        }
    }
}
exports.EnrollmentController = EnrollmentController;
class StudentRecordsController {
    static async getAttendance(req, res) {
        try {
            const parentId = req.user?.id;
            const { studentId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const records = await studentRecords_1.StudentRecordsService.getChildAttendance(parentId, studentId);
            return res.status(200).json({ success: true, data: records });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error fetching attendance" });
        }
    }
    static async getCertificates(req, res) {
        try {
            const parentId = req.user?.id;
            const { studentId } = req.params;
            if (!parentId) {
                return res.status(401).json({ success: false, message: "Unauthorized" });
            }
            const certificates = await studentRecords_1.StudentRecordsService.getChildCertificates(parentId, studentId);
            return res.status(200).json({ success: true, data: certificates });
        }
        catch (error) {
            return res.status(400).json({ success: false, message: error.message || "Error fetching certificates" });
        }
    }
}
exports.StudentRecordsController = StudentRecordsController;
//# sourceMappingURL=academy.controller.js.map