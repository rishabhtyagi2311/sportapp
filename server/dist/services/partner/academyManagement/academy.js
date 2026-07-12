"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AcademyService = void 0;
const index_1 = require("../../../index");
class AcademyService {
    static mapAcademyForClient(academy) {
        return {
            id: academy.id,
            academyName: academy.academyName,
            sportType: academy.sportType,
            address: academy.address,
            city: academy.city,
            coachName: academy.coachName,
            contactNumber: academy.contactNumber,
            facilities: academy.facilities,
            fee: academy.fee,
            feeStructure: academy.feeStructure,
            isActive: academy.isActive,
            coaches: (academy.coaches || []).map((coach) => ({
                id: coach.id,
                name: coach.name,
                specialization: coach.specialization,
                experience: coach.experience || '',
                contact: coach.contact || '',
            })),
            studentCount: academy._count?.students ?? undefined,
            photos: (academy.photos || []).map((photo) => photo.url),
            createdAt: academy.createdAt?.toISOString?.() ?? academy.createdAt,
            updatedAt: academy.updatedAt?.toISOString?.() ?? academy.updatedAt,
        };
    }
    static async createAcademy(data, partnerId) {
        const academy = await index_1.prisma.academy.create({
            data: {
                academyName: data.academyName,
                sportType: data.sportType,
                address: data.address,
                city: data.city,
                coachName: data.coachName,
                contactNumber: data.contactNumber,
                facilities: data.facilities,
                fee: data.fee,
                feeStructure: data.feeStructure || 'Monthly',
                isActive: data.isActive ?? true,
                partner: { connect: { id: partnerId } },
            },
            include: { coaches: true },
        });
        return this.mapAcademyForClient(academy);
    }
    static async getAcademiesByPartner(partnerId) {
        const academies = await index_1.prisma.academy.findMany({
            where: { partnerId },
            include: {
                coaches: true,
                _count: { select: { students: true } },
                photos: { orderBy: { createdAt: 'desc' }, take: 1 },
            },
            orderBy: { createdAt: 'desc' },
        });
        return academies.map((academy) => this.mapAcademyForClient(academy));
    }
    static async getAcademyById(academyId, partnerId) {
        const academy = await index_1.prisma.academy.findFirst({
            where: { id: academyId, partnerId },
            include: { coaches: true, photos: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        return academy ? this.mapAcademyForClient(academy) : null;
    }
    static async updateAcademy(academyId, partnerId, data) {
        const existing = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!existing) {
            throw new Error('Academy not found or not owned by partner');
        }
        const academy = await index_1.prisma.academy.update({
            where: { id: academyId },
            data: {
                academyName: data.academyName,
                sportType: data.sportType,
                address: data.address,
                city: data.city,
                coachName: data.coachName,
                contactNumber: data.contactNumber,
                facilities: data.facilities,
                fee: data.fee,
                feeStructure: data.feeStructure,
                isActive: data.isActive,
            },
            include: { coaches: true, photos: { orderBy: { createdAt: 'desc' }, take: 1 } },
        });
        return this.mapAcademyForClient(academy);
    }
    static async deleteAcademy(academyId, partnerId) {
        const existing = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!existing) {
            throw new Error('Academy not found or not owned by partner');
        }
        await index_1.prisma.academy.delete({ where: { id: academyId } });
    }
    static async addCoach(academyId, partnerId, data) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const coach = await index_1.prisma.coach.create({
            data: {
                academyId,
                name: data.name,
                specialization: data.specialization,
                experience: data.experience,
                contact: data.contact,
            },
        });
        return coach;
    }
    static async updateCoach(academyId, partnerId, coachId, data) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const existing = await index_1.prisma.coach.findFirst({ where: { id: coachId, academyId } });
        if (!existing) {
            throw new Error('Coach not found');
        }
        const coach = await index_1.prisma.coach.update({
            where: { id: coachId },
            data: {
                name: data.name,
                specialization: data.specialization,
                experience: data.experience,
                contact: data.contact,
            },
        });
        return coach;
    }
    static async removeCoach(academyId, partnerId, coachId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const coach = await index_1.prisma.coach.findFirst({ where: { id: coachId, academyId } });
        if (!coach) {
            throw new Error('Coach not found');
        }
        await index_1.prisma.coach.delete({ where: { id: coachId } });
    }
    /* ------------------------------------------------------------------ */
    /* STUDENTS                                                            */
    /* ------------------------------------------------------------------ */
    static mapStudentForClient(student) {
        return {
            id: student.id,
            academyId: student.academyId,
            name: student.name,
            age: student.age,
            fatherName: student.fatherName,
            fatherContact: student.fatherContact,
            enrollmentDate: student.enrollmentDate.toISOString().split('T')[0],
        };
    }
    static async addStudent(academyId, partnerId, data) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const student = await index_1.prisma.student.create({
            data: {
                academyId,
                name: data.name,
                age: data.age,
                fatherName: data.fatherName,
                fatherContact: data.fatherContact,
            },
        });
        return this.mapStudentForClient(student);
    }
    static async getStudentsByAcademy(academyId, partnerId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const students = await index_1.prisma.student.findMany({
            where: { academyId },
            orderBy: { createdAt: 'desc' },
        });
        return students.map((student) => this.mapStudentForClient(student));
    }
    static async updateStudent(academyId, partnerId, studentId, data) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const existing = await index_1.prisma.student.findFirst({ where: { id: studentId, academyId } });
        if (!existing) {
            throw new Error('Student not found');
        }
        const student = await index_1.prisma.student.update({
            where: { id: studentId },
            data: {
                name: data.name,
                age: data.age,
                fatherName: data.fatherName,
                fatherContact: data.fatherContact,
            },
        });
        return this.mapStudentForClient(student);
    }
    static async deleteStudent(academyId, partnerId, studentId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const student = await index_1.prisma.student.findFirst({ where: { id: studentId, academyId } });
        if (!student) {
            throw new Error('Student not found');
        }
        await index_1.prisma.student.delete({ where: { id: studentId } });
    }
    /* ------------------------------------------------------------------ */
    /* ATTENDANCE                                                          */
    /* ------------------------------------------------------------------ */
    static mapAttendanceForClient(record) {
        return {
            studentId: record.studentId,
            date: record.date.toISOString().split('T')[0],
            present: record.present,
        };
    }
    static async assertStudentOwnedByPartner(studentId, partnerId) {
        const student = await index_1.prisma.student.findFirst({
            where: { id: studentId, academy: { partnerId } },
        });
        if (!student) {
            throw new Error('Student not found or not owned by partner');
        }
        return student;
    }
    static async markAttendance(studentId, partnerId, data) {
        await this.assertStudentOwnedByPartner(studentId, partnerId);
        const record = await index_1.prisma.attendanceRecord.upsert({
            where: { studentId_date: { studentId, date: new Date(data.date) } },
            create: { studentId, date: new Date(data.date), present: data.present },
            update: { present: data.present },
        });
        return this.mapAttendanceForClient(record);
    }
    static async getAttendanceForAcademy(academyId, partnerId, date) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const where = { student: { academyId } };
        if (date) {
            where.date = new Date(date);
        }
        const records = await index_1.prisma.attendanceRecord.findMany({ where });
        return records.map((record) => this.mapAttendanceForClient(record));
    }
    static async getAttendanceForStudent(studentId, partnerId) {
        await this.assertStudentOwnedByPartner(studentId, partnerId);
        const records = await index_1.prisma.attendanceRecord.findMany({
            where: { studentId },
            orderBy: { date: 'asc' },
        });
        return records.map((record) => this.mapAttendanceForClient(record));
    }
    /* ------------------------------------------------------------------ */
    /* PHOTOS                                                              */
    /* ------------------------------------------------------------------ */
    static async addPhoto(academyId, partnerId, url) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        return index_1.prisma.academyPhoto.create({ data: { academyId, url } });
    }
    static async getPhotosByAcademy(academyId, partnerId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        return index_1.prisma.academyPhoto.findMany({ where: { academyId }, orderBy: { createdAt: 'desc' } });
    }
    static async removePhoto(academyId, partnerId, photoId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const photo = await index_1.prisma.academyPhoto.findFirst({ where: { id: photoId, academyId } });
        if (!photo) {
            throw new Error('Photo not found');
        }
        await index_1.prisma.academyPhoto.delete({ where: { id: photoId } });
    }
    /* ------------------------------------------------------------------ */
    /* CERTIFICATES                                                        */
    /* ------------------------------------------------------------------ */
    static mapCertificateForClient(cert) {
        return {
            id: cert.id,
            studentId: cert.studentId,
            template: cert.template,
            studentName: cert.studentName,
            academyName: cert.academyName,
            achievement: cert.achievement,
            date: cert.date.toISOString().split('T')[0],
            certificateNumber: cert.certificateNumber,
        };
    }
    static async createCertificate(studentId, partnerId, data) {
        const student = await index_1.prisma.student.findFirst({
            where: { id: studentId, academy: { partnerId } },
            include: { academy: true },
        });
        if (!student) {
            throw new Error('Student not found or not owned by partner');
        }
        const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
        const certificate = await index_1.prisma.certificate.create({
            data: {
                studentId,
                template: data.template,
                achievement: data.achievement,
                studentName: student.name,
                academyName: student.academy.academyName,
                certificateNumber,
            },
        });
        return this.mapCertificateForClient(certificate);
    }
    static async getCertificatesByAcademy(academyId, partnerId) {
        const academy = await index_1.prisma.academy.findFirst({ where: { id: academyId, partnerId } });
        if (!academy) {
            throw new Error('Academy not found or not owned by partner');
        }
        const certificates = await index_1.prisma.certificate.findMany({
            where: { student: { academyId } },
            orderBy: { date: 'desc' },
        });
        return certificates.map((cert) => this.mapCertificateForClient(cert));
    }
}
exports.AcademyService = AcademyService;
//# sourceMappingURL=academy.js.map