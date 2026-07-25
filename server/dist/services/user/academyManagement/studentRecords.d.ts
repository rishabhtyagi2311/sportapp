export declare class StudentRecordsService {
    private static assertStudentOwnedByParent;
    static getChildAttendance(parentId: number, studentId: string): Promise<{
        studentId: any;
        date: any;
        present: any;
    }[]>;
    static getChildCertificates(parentId: number, studentId: string): Promise<{
        id: any;
        studentId: any;
        template: any;
        studentName: any;
        academyName: any;
        achievement: any;
        date: any;
        certificateNumber: any;
    }[]>;
}
//# sourceMappingURL=studentRecords.d.ts.map