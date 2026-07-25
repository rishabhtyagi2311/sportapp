"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentRecordsService = void 0;
const index_1 = require("../../../index");
const academy_1 = require("../../partner/academyManagement/academy");
class StudentRecordsService {
    static async assertStudentOwnedByParent(studentId, parentId) {
        const student = await index_1.prisma.student.findFirst({
            where: { id: studentId, childProfile: { parentId } },
        });
        if (!student) {
            throw new Error('Student not found or not linked to your account');
        }
        return student;
    }
    static async getChildAttendance(parentId, studentId) {
        await this.assertStudentOwnedByParent(studentId, parentId);
        const records = await index_1.prisma.attendanceRecord.findMany({
            where: { studentId },
            orderBy: { date: 'asc' },
        });
        return records.map((record) => academy_1.AcademyService.mapAttendanceForClient(record));
    }
    static async getChildCertificates(parentId, studentId) {
        await this.assertStudentOwnedByParent(studentId, parentId);
        const certificates = await index_1.prisma.certificate.findMany({
            where: { studentId },
            orderBy: { date: 'desc' },
        });
        return certificates.map((cert) => academy_1.AcademyService.mapCertificateForClient(cert));
    }
}
exports.StudentRecordsService = StudentRecordsService;
//# sourceMappingURL=studentRecords.js.map