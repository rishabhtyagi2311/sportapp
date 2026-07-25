import { prisma as globalClient } from "../../../index";
import { AcademyService } from "../../partner/academyManagement/academy";

function mapEnrollmentForClient(student: any) {
  const mapped = AcademyService.mapStudentForClient(student);
  return {
    ...mapped,
    childProfileId: student.childProfileId,
    ...(student.academy ? { academyName: student.academy.academyName } : {}),
  };
}

export class EnrollmentService {
  static async enrollChild(parentId: number, data: { childProfileId: string; academyId: string }) {
    const childProfile = await globalClient.childProfile.findFirst({
      where: { id: data.childProfileId, parentId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    const academy = await globalClient.academy.findFirst({
      where: { id: data.academyId, isActive: true },
    });

    if (!academy) {
      throw new Error('Academy not found');
    }

    const existing = await globalClient.student.findFirst({
      where: { childProfileId: data.childProfileId, academyId: data.academyId },
    });

    if (existing && existing.status !== 'inactive') {
      throw new Error('This child is already enrolled at this academy');
    }

    // A previously withdrawn/rejected enrollment re-requests on the same
    // row, preserving its attendance/certificate history, instead of
    // creating a duplicate Student record.
    const student = existing
      ? await globalClient.student.update({
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
      : await globalClient.student.create({
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

  static async withdrawEnrollment(parentId: number, studentId: string) {
    const student = await globalClient.student.findFirst({
      where: { id: studentId, childProfile: { parentId } },
    });

    if (!student) {
      throw new Error('Enrollment not found');
    }

    if (student.status === 'inactive') {
      throw new Error('This enrollment has already been withdrawn');
    }

    const updated = await globalClient.student.update({
      where: { id: studentId },
      data: { status: 'inactive' },
      include: { academy: true },
    });

    return mapEnrollmentForClient(updated);
  }

  static async getMyEnrollments(parentId: number) {
    const students = await globalClient.student.findMany({
      where: { childProfile: { parentId } },
      include: { academy: true },
      orderBy: { enrollmentDate: 'desc' },
    });

    return students.map(mapEnrollmentForClient);
  }

  static async getEnrollmentsForChild(parentId: number, childProfileId: string) {
    const childProfile = await globalClient.childProfile.findFirst({
      where: { id: childProfileId, parentId },
    });

    if (!childProfile) {
      throw new Error('Child profile not found');
    }

    const students = await globalClient.student.findMany({
      where: { childProfileId },
      include: { academy: true },
      orderBy: { enrollmentDate: 'desc' },
    });

    return students.map(mapEnrollmentForClient);
  }
}
