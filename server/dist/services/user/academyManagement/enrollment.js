"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnrollmentService = void 0;
const index_1 = require("../../../index");
const academy_1 = require("../../partner/academyManagement/academy");
function mapEnrollmentForClient(student) {
    const mapped = academy_1.AcademyService.mapStudentForClient(student);
    return {
        ...mapped,
        childProfileId: student.childProfileId,
        ...(student.academy ? { academyName: student.academy.academyName } : {}),
    };
}
class EnrollmentService {
    static async enrollChild(parentId, data) {
        const childProfile = await index_1.prisma.childProfile.findFirst({
            where: { id: data.childProfileId, parentId },
        });
        if (!childProfile) {
            throw new Error('Child profile not found');
        }
        const academy = await index_1.prisma.academy.findFirst({
            where: { id: data.academyId, isActive: true },
        });
        if (!academy) {
            throw new Error('Academy not found');
        }
        const existing = await index_1.prisma.student.findFirst({
            where: { childProfileId: data.childProfileId, academyId: data.academyId },
        });
        if (existing && existing.status !== 'inactive') {
            throw new Error('This child is already enrolled at this academy');
        }
        // A previously withdrawn/rejected enrollment re-requests on the same
        // row, preserving its attendance/certificate history, instead of
        // creating a duplicate Student record.
        const student = existing
            ? await index_1.prisma.student.update({
                where: { id: existing.id },
                data: {
                    name: childProfile.childName,
                    age: childProfile.childAge,
                    fatherName: childProfile.fatherName,
                    fatherContact: childProfile.fatherContact || '',
                    status: 'pending',
                },
                include: { academy: true },
            })
            : await index_1.prisma.student.create({
                data: {
                    academyId: data.academyId,
                    childProfileId: data.childProfileId,
                    name: childProfile.childName,
                    age: childProfile.childAge,
                    fatherName: childProfile.fatherName,
                    fatherContact: childProfile.fatherContact || '',
                    status: 'pending',
                },
                include: { academy: true },
            });
        return mapEnrollmentForClient(student);
    }
    static async withdrawEnrollment(parentId, studentId) {
        const student = await index_1.prisma.student.findFirst({
            where: { id: studentId, childProfile: { parentId } },
        });
        if (!student) {
            throw new Error('Enrollment not found');
        }
        if (student.status === 'inactive') {
            throw new Error('This enrollment has already been withdrawn');
        }
        const updated = await index_1.prisma.student.update({
            where: { id: studentId },
            data: { status: 'inactive' },
            include: { academy: true },
        });
        return mapEnrollmentForClient(updated);
    }
    static async getMyEnrollments(parentId) {
        const students = await index_1.prisma.student.findMany({
            where: { childProfile: { parentId } },
            include: { academy: true },
            orderBy: { enrollmentDate: 'desc' },
        });
        return students.map(mapEnrollmentForClient);
    }
    static async getEnrollmentsForChild(parentId, childProfileId) {
        const childProfile = await index_1.prisma.childProfile.findFirst({
            where: { id: childProfileId, parentId },
        });
        if (!childProfile) {
            throw new Error('Child profile not found');
        }
        const students = await index_1.prisma.student.findMany({
            where: { childProfileId },
            include: { academy: true },
            orderBy: { enrollmentDate: 'desc' },
        });
        return students.map(mapEnrollmentForClient);
    }
}
exports.EnrollmentService = EnrollmentService;
//# sourceMappingURL=enrollment.js.map