// types.ts

export type Academy = {
  id: string;
  academyName: string;
  sportType: string;
  address: string;
  coachName: string;
  contactNumber: string;
  facilities: string;

  fee: number;
  feeStructure?: 'Monthly' | 'Quarterly' | 'Yearly';
  isActive?: boolean;
  city: string;
  coaches?: Coach[];
  headCoach?: string;
  studentCount?: number;
  // Cover photo only (most recent upload) — for list/card display.
  // The full gallery (with photo ids, for delete) is fetched separately via AcademyPhoto.
  photos?: string[];
};

export type Coach = {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  contact: string;
};

export type AcademyPhoto = {
  id: string;
  academyId: string;
  url: string;
};

export type Student = {
  id: string;
  name: string;
  age: number;
  fatherName: string;
  fatherContact: string;
  academyId: string;
  status?: 'active' | 'pending' | 'inactive';
  enrollmentDate: string;
};

export type Attendance = {
  studentId: string;
  date: string;
  present: boolean;
};

export type Certificate = {
  id: string;
  studentId: string;
  template: string;
  studentName: string;
  academyName: string;
  achievement: string;
  date: string;
  certificateNumber: string;
};