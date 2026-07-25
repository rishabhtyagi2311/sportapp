export declare class AcademyService {
    static mapAcademyForClient(academy: any): {
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    };
    static createAcademy(data: any, partnerId: string): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    }>;
    static getAcademiesByPartner(partnerId: string): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    static getAcademyById(academyId: string, partnerId: string): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    static updateAcademy(academyId: string, partnerId: string, data: any): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    }>;
    static deleteAcademy(academyId: string, partnerId: string): Promise<void>;
    /** Public, unauthenticated browse — no partnerId scoping, active academies only. */
    static getPublicAcademies(filters?: {
        city?: string;
        sportType?: string;
    }): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    static getPublicAcademyById(academyId: string): Promise<{
        id: any;
        academyName: any;
        sportType: any;
        address: any;
        city: any;
        coachName: any;
        contactNumber: any;
        facilities: any;
        fee: any;
        feeStructure: any;
        isActive: any;
        averageRating: any;
        reviewCount: any;
        coaches: any;
        studentCount: any;
        photos: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    static addCoach(academyId: string, partnerId: string, data: any): Promise<{
        id: string;
        name: string;
        academyId: string;
        specialization: string;
        experience: string | null;
        contact: string | null;
    }>;
    static updateCoach(academyId: string, partnerId: string, coachId: string, data: any): Promise<{
        id: string;
        name: string;
        academyId: string;
        specialization: string;
        experience: string | null;
        contact: string | null;
    }>;
    static removeCoach(academyId: string, partnerId: string, coachId: string): Promise<void>;
    static mapStudentForClient(student: any): {
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    };
    static addStudent(academyId: string, partnerId: string, data: any): Promise<{
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static getStudentsByAcademy(academyId: string, partnerId: string, status?: string): Promise<{
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }[]>;
    static approveEnrollment(academyId: string, partnerId: string, studentId: string): Promise<{
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static rejectEnrollment(academyId: string, partnerId: string, studentId: string): Promise<{
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static updateStudent(academyId: string, partnerId: string, studentId: string, data: any): Promise<{
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static deleteStudent(academyId: string, partnerId: string, studentId: string): Promise<void>;
    static mapAttendanceForClient(record: any): {
        studentId: any;
        date: any;
        present: any;
    };
    private static assertStudentOwnedByPartner;
    static markAttendance(studentId: string, partnerId: string, data: {
        date: string;
        present: boolean;
    }): Promise<{
        studentId: any;
        date: any;
        present: any;
    }>;
    static getAttendanceForAcademy(academyId: string, partnerId: string, date?: string): Promise<{
        studentId: any;
        date: any;
        present: any;
    }[]>;
    static getAttendanceForStudent(studentId: string, partnerId: string): Promise<{
        studentId: any;
        date: any;
        present: any;
    }[]>;
    static addPhoto(academyId: string, partnerId: string, url: string): Promise<{
        id: string;
        createdAt: Date;
        url: string;
        academyId: string;
    }>;
    static getPhotosByAcademy(academyId: string, partnerId: string): Promise<{
        id: string;
        createdAt: Date;
        url: string;
        academyId: string;
    }[]>;
    static removePhoto(academyId: string, partnerId: string, photoId: string): Promise<void>;
    static mapCertificateForClient(cert: any): {
        id: any;
        studentId: any;
        template: any;
        studentName: any;
        academyName: any;
        achievement: any;
        date: any;
        certificateNumber: any;
    };
    static createCertificate(studentId: string, partnerId: string, data: {
        template: string;
        achievement: string;
    }): Promise<{
        id: any;
        studentId: any;
        template: any;
        studentName: any;
        academyName: any;
        achievement: any;
        date: any;
        certificateNumber: any;
    }>;
    static getCertificatesByAcademy(academyId: string, partnerId: string): Promise<{
        id: any;
        studentId: any;
        template: any;
        studentName: any;
        academyName: any;
        achievement: any;
        date: any;
        certificateNumber: any;
    }[]>;
    static mapAnnouncementForClient(announcement: any): {
        id: any;
        academyId: any;
        content: any;
        createdAt: any;
    };
    static createAnnouncement(academyId: string, partnerId: string, content: string): Promise<{
        id: any;
        academyId: any;
        content: any;
        createdAt: any;
    }>;
    static getAnnouncementsByAcademy(academyId: string, partnerId: string): Promise<{
        id: any;
        academyId: any;
        content: any;
        createdAt: any;
    }[]>;
    /** Public, unauthenticated read — no sensitive data on Announcement. */
    static getPublicAnnouncements(academyId: string): Promise<{
        id: any;
        academyId: any;
        content: any;
        createdAt: any;
    }[]>;
    static removeAnnouncement(academyId: string, partnerId: string, announcementId: string): Promise<void>;
    static mapDemoBookingForClient(booking: any): any;
    static getDemoBookingsForAcademy(academyId: string, partnerId: string, status?: string): Promise<any[]>;
    private static assertDemoBookingOwnedByPartner;
    static confirmDemoBooking(bookingId: string, partnerId: string): Promise<any>;
    static completeDemoBooking(bookingId: string, partnerId: string): Promise<any>;
    static cancelDemoBooking(bookingId: string, partnerId: string): Promise<any>;
}
//# sourceMappingURL=academy.d.ts.map