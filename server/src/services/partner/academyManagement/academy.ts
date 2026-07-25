import { prisma as globalClient } from "../../../index";

export class AcademyService {
  static mapAcademyForClient(academy: any) {
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
      averageRating: academy.averageRating,
      reviewCount: academy.reviewCount,
      coaches: (academy.coaches || []).map((coach: any) => ({
        id: coach.id,
        name: coach.name,
        specialization: coach.specialization,
        experience: coach.experience || '',
        contact: coach.contact || '',
      })),
      studentCount: academy._count?.students ?? undefined,
      photos: (academy.photos || []).map((photo: any) => photo.url),
      createdAt: academy.createdAt?.toISOString?.() ?? academy.createdAt,
      updatedAt: academy.updatedAt?.toISOString?.() ?? academy.updatedAt,
    };
  }

  static async createAcademy(data: any, partnerId: string) {
    const academy = await globalClient.academy.create({
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

  static async getAcademiesByPartner(partnerId: string) {
    const academies = await globalClient.academy.findMany({
      where: { partnerId },
      include: {
        coaches: true,
        _count: { select: { students: { where: { status: 'active' } } } },
        photos: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return academies.map((academy) => this.mapAcademyForClient(academy));
  }

  static async getAcademyById(academyId: string, partnerId: string) {
    const academy = await globalClient.academy.findFirst({
      where: { id: academyId, partnerId },
      include: { coaches: true, photos: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    return academy ? this.mapAcademyForClient(academy) : null;
  }

  static async updateAcademy(academyId: string, partnerId: string, data: any) {
    const existing = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!existing) {
      throw new Error('Academy not found or not owned by partner');
    }

    const academy = await globalClient.academy.update({
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

  static async deleteAcademy(academyId: string, partnerId: string) {
    const existing = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!existing) {
      throw new Error('Academy not found or not owned by partner');
    }

    await globalClient.academy.delete({ where: { id: academyId } });
  }

  /** Public, unauthenticated browse — no partnerId scoping, active academies only. */
  static async getPublicAcademies(filters: { city?: string; sportType?: string } = {}) {
    const academies = await globalClient.academy.findMany({
      where: {
        isActive: true,
        ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
        ...(filters.sportType ? { sportType: { equals: filters.sportType, mode: 'insensitive' } } : {}),
      },
      include: {
        coaches: true,
        _count: { select: { students: { where: { status: 'active' } } } },
        photos: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return academies.map((academy) => this.mapAcademyForClient(academy));
  }

  static async getPublicAcademyById(academyId: string) {
    const academy = await globalClient.academy.findFirst({
      where: { id: academyId, isActive: true },
      include: { coaches: true, photos: { orderBy: { createdAt: 'desc' } } },
    });

    return academy ? this.mapAcademyForClient(academy) : null;
  }

  static async addCoach(academyId: string, partnerId: string, data: any) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const coach = await globalClient.coach.create({
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

  static async updateCoach(academyId: string, partnerId: string, coachId: string, data: any) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const existing = await globalClient.coach.findFirst({ where: { id: coachId, academyId } });

    if (!existing) {
      throw new Error('Coach not found');
    }

    const coach = await globalClient.coach.update({
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

  static async removeCoach(academyId: string, partnerId: string, coachId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const coach = await globalClient.coach.findFirst({ where: { id: coachId, academyId } });

    if (!coach) {
      throw new Error('Coach not found');
    }

    await globalClient.coach.delete({ where: { id: coachId } });
  }

  /* ------------------------------------------------------------------ */
  /* STUDENTS                                                            */
  /* ------------------------------------------------------------------ */

  static mapStudentForClient(student: any) {
    return {
      id: student.id,
      academyId: student.academyId,
      name: student.name,
      age: student.age,
      fatherName: student.fatherName,
      fatherContact: student.fatherContact,
      status: student.status,
      enrollmentDate: student.enrollmentDate.toISOString().split('T')[0],
    };
  }

  static async addStudent(academyId: string, partnerId: string, data: any) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const student = await globalClient.student.create({
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

  static async getStudentsByAcademy(academyId: string, partnerId: string, status?: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const students = await globalClient.student.findMany({
      where: { academyId, ...(status ? { status } : {}) },
      orderBy: { createdAt: 'desc' },
    });

    return students.map((student) => this.mapStudentForClient(student));
  }

  static async approveEnrollment(academyId: string, partnerId: string, studentId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const student = await globalClient.student.findFirst({ where: { id: studentId, academyId } });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.status !== 'pending') {
      throw new Error(`Cannot approve a '${student.status}' enrollment`);
    }

    const updated = await globalClient.student.update({
      where: { id: studentId },
      data: { status: 'active' },
    });

    return this.mapStudentForClient(updated);
  }

  static async rejectEnrollment(academyId: string, partnerId: string, studentId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const student = await globalClient.student.findFirst({ where: { id: studentId, academyId } });

    if (!student) {
      throw new Error('Student not found');
    }

    if (student.status !== 'pending') {
      throw new Error(`Cannot reject a '${student.status}' enrollment`);
    }

    const updated = await globalClient.student.update({
      where: { id: studentId },
      data: { status: 'inactive' },
    });

    return this.mapStudentForClient(updated);
  }

  static async updateStudent(academyId: string, partnerId: string, studentId: string, data: any) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const existing = await globalClient.student.findFirst({ where: { id: studentId, academyId } });

    if (!existing) {
      throw new Error('Student not found');
    }

    const student = await globalClient.student.update({
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

  static async deleteStudent(academyId: string, partnerId: string, studentId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const student = await globalClient.student.findFirst({ where: { id: studentId, academyId } });

    if (!student) {
      throw new Error('Student not found');
    }

    await globalClient.student.delete({ where: { id: studentId } });
  }

  /* ------------------------------------------------------------------ */
  /* ATTENDANCE                                                          */
  /* ------------------------------------------------------------------ */

  static mapAttendanceForClient(record: any) {
    return {
      studentId: record.studentId,
      date: record.date.toISOString().split('T')[0],
      present: record.present,
    };
  }

  private static async assertStudentOwnedByPartner(studentId: string, partnerId: string) {
    const student = await globalClient.student.findFirst({
      where: { id: studentId, academy: { partnerId } },
    });

    if (!student) {
      throw new Error('Student not found or not owned by partner');
    }

    return student;
  }

  static async markAttendance(studentId: string, partnerId: string, data: { date: string; present: boolean }) {
    await this.assertStudentOwnedByPartner(studentId, partnerId);

    const record = await globalClient.attendanceRecord.upsert({
      where: { studentId_date: { studentId, date: new Date(data.date) } },
      create: { studentId, date: new Date(data.date), present: data.present },
      update: { present: data.present },
    });

    return this.mapAttendanceForClient(record);
  }

  static async getAttendanceForAcademy(academyId: string, partnerId: string, date?: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const where: any = { student: { academyId } };
    if (date) {
      where.date = new Date(date);
    }

    const records = await globalClient.attendanceRecord.findMany({ where });
    return records.map((record) => this.mapAttendanceForClient(record));
  }

  static async getAttendanceForStudent(studentId: string, partnerId: string) {
    await this.assertStudentOwnedByPartner(studentId, partnerId);

    const records = await globalClient.attendanceRecord.findMany({
      where: { studentId },
      orderBy: { date: 'asc' },
    });

    return records.map((record) => this.mapAttendanceForClient(record));
  }

  /* ------------------------------------------------------------------ */
  /* PHOTOS                                                              */
  /* ------------------------------------------------------------------ */

  static async addPhoto(academyId: string, partnerId: string, url: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    return globalClient.academyPhoto.create({ data: { academyId, url } });
  }

  static async getPhotosByAcademy(academyId: string, partnerId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    return globalClient.academyPhoto.findMany({ where: { academyId }, orderBy: { createdAt: 'desc' } });
  }

  static async removePhoto(academyId: string, partnerId: string, photoId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const photo = await globalClient.academyPhoto.findFirst({ where: { id: photoId, academyId } });

    if (!photo) {
      throw new Error('Photo not found');
    }

    await globalClient.academyPhoto.delete({ where: { id: photoId } });
  }

  /* ------------------------------------------------------------------ */
  /* CERTIFICATES                                                        */
  /* ------------------------------------------------------------------ */

  static mapCertificateForClient(cert: any) {
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

  static async createCertificate(studentId: string, partnerId: string, data: { template: string; achievement: string }) {
    const student = await globalClient.student.findFirst({
      where: { id: studentId, academy: { partnerId } },
      include: { academy: true },
    });

    if (!student) {
      throw new Error('Student not found or not owned by partner');
    }

    const certificateNumber = `CERT-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const certificate = await globalClient.certificate.create({
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

  static async getCertificatesByAcademy(academyId: string, partnerId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const certificates = await globalClient.certificate.findMany({
      where: { student: { academyId } },
      orderBy: { date: 'desc' },
    });

    return certificates.map((cert) => this.mapCertificateForClient(cert));
  }

  /* ------------------------------------------------------------------ */
  /* ANNOUNCEMENTS                                                       */
  /* ------------------------------------------------------------------ */

  static mapAnnouncementForClient(announcement: any) {
    return {
      id: announcement.id,
      academyId: announcement.academyId,
      content: announcement.content,
      createdAt: announcement.createdAt.toISOString(),
    };
  }

  static async createAnnouncement(academyId: string, partnerId: string, content: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const announcement = await globalClient.announcement.create({ data: { academyId, content } });

    return this.mapAnnouncementForClient(announcement);
  }

  static async getAnnouncementsByAcademy(academyId: string, partnerId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const announcements = await globalClient.announcement.findMany({
      where: { academyId },
      orderBy: { createdAt: 'desc' },
    });

    return announcements.map((a) => this.mapAnnouncementForClient(a));
  }

  /** Public, unauthenticated read — no sensitive data on Announcement. */
  static async getPublicAnnouncements(academyId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, isActive: true } });

    if (!academy) {
      throw new Error('Academy not found');
    }

    const announcements = await globalClient.announcement.findMany({
      where: { academyId },
      orderBy: { createdAt: 'desc' },
    });

    return announcements.map((a) => this.mapAnnouncementForClient(a));
  }

  static async removeAnnouncement(academyId: string, partnerId: string, announcementId: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const announcement = await globalClient.announcement.findFirst({ where: { id: announcementId, academyId } });

    if (!announcement) {
      throw new Error('Announcement not found');
    }

    await globalClient.announcement.delete({ where: { id: announcementId } });
  }

  /* ------------------------------------------------------------------ */
  /* DEMO BOOKINGS                                                       */
  /* ------------------------------------------------------------------ */

  static mapDemoBookingForClient(booking: any) {
    const { childProfile, ...rest } = booking;
    return {
      ...rest,
      bookingDate: booking.bookingDate.toISOString().split('T')[0],
      ...(childProfile
        ? { childName: childProfile.childName, fatherName: childProfile.fatherName, fatherContact: childProfile.fatherContact }
        : {}),
    };
  }

  static async getDemoBookingsForAcademy(academyId: string, partnerId: string, status?: string) {
    const academy = await globalClient.academy.findFirst({ where: { id: academyId, partnerId } });

    if (!academy) {
      throw new Error('Academy not found or not owned by partner');
    }

    const where: any = { academyId };
    if (status) {
      where.status = status;
    }

    const bookings = await globalClient.demoBooking.findMany({
      where,
      include: { childProfile: true },
      orderBy: { bookingDate: 'asc' },
    });

    return bookings.map((b) => this.mapDemoBookingForClient(b));
  }

  private static async assertDemoBookingOwnedByPartner(bookingId: string, partnerId: string) {
    const booking = await globalClient.demoBooking.findFirst({
      where: { id: bookingId, academy: { partnerId } },
      include: { childProfile: true },
    });

    if (!booking) {
      throw new Error('Demo booking not found or not owned by partner');
    }

    return booking;
  }

  static async confirmDemoBooking(bookingId: string, partnerId: string) {
    const booking = await this.assertDemoBookingOwnedByPartner(bookingId, partnerId);

    if (booking.status !== 'pending') {
      throw new Error(`Cannot confirm a '${booking.status}' demo booking`);
    }

    const updated = await globalClient.demoBooking.update({
      where: { id: bookingId },
      data: { status: 'confirmed' },
      include: { childProfile: true },
    });

    return this.mapDemoBookingForClient(updated);
  }

  static async completeDemoBooking(bookingId: string, partnerId: string) {
    const booking = await this.assertDemoBookingOwnedByPartner(bookingId, partnerId);

    if (booking.status !== 'confirmed') {
      throw new Error(`Cannot complete a '${booking.status}' demo booking`);
    }

    const updated = await globalClient.demoBooking.update({
      where: { id: bookingId },
      data: { status: 'completed' },
      include: { childProfile: true },
    });

    return this.mapDemoBookingForClient(updated);
  }

  static async cancelDemoBooking(bookingId: string, partnerId: string) {
    const booking = await this.assertDemoBookingOwnedByPartner(bookingId, partnerId);

    if (booking.status === 'cancelled' || booking.status === 'completed') {
      throw new Error(`Demo booking is already ${booking.status}`);
    }

    const updated = await globalClient.demoBooking.update({
      where: { id: bookingId },
      data: { status: 'cancelled' },
      include: { childProfile: true },
    });

    return this.mapDemoBookingForClient(updated);
  }
}
