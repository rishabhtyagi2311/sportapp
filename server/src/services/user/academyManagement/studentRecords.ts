import { prisma as globalClient } from "../../../index";
import { AcademyService } from "../../partner/academyManagement/academy";

export class StudentRecordsService {
  private static async assertStudentOwnedByParent(studentId: string, parentId: number) {
    const student = await globalClient.student.findFirst({
      where: { id: studentId, childProfile: { parentId } },
    });

    if (!student) {
      throw new Error('Student not found or not linked to your account');
    }

    return student;
  }

  static async getChildAttendance(parentId: number, studentId: string) {
    await this.assertStudentOwnedByParent(studentId, parentId);

    const records = await globalClient.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
    });

    return records.map((record) => AcademyService.mapAttendanceForClient(record));
  }

  static async getChildCertificates(parentId: number, studentId: string) {
    await this.assertStudentOwnedByParent(studentId, parentId);

    const certificates = await globalClient.certificate.findMany({
      where: { studentId },
      orderBy: { date: 'desc' },
    });

    return certificates.map((cert) => AcademyService.mapCertificateForClient(cert));
  }
}
