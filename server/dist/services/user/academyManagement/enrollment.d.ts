export declare class EnrollmentService {
    static enrollChild(parentId: number, data: {
        childProfileId: string;
        academyId: string;
    }): Promise<{
        academyName?: any;
        childProfileId: any;
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static withdrawEnrollment(parentId: number, studentId: string): Promise<{
        academyName?: any;
        childProfileId: any;
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }>;
    static getMyEnrollments(parentId: number): Promise<{
        academyName?: any;
        childProfileId: any;
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }[]>;
    static getEnrollmentsForChild(parentId: number, childProfileId: string): Promise<{
        academyName?: any;
        childProfileId: any;
        id: any;
        academyId: any;
        name: any;
        age: any;
        fatherName: any;
        fatherContact: any;
        status: any;
        enrollmentDate: any;
    }[]>;
}
//# sourceMappingURL=enrollment.d.ts.map