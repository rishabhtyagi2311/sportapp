// types/academy.ts — real, server-backed academy shapes (parent/child side).

export interface Coach {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  contact: string;
}

export interface Academy {
  id: string;
  academyName: string;
  sportType: string;
  address: string;
  city: string;
  coachName: string;
  contactNumber: string;
  facilities: string;
  fee: number;
  feeStructure: string;
  isActive: boolean;
  averageRating: number;
  reviewCount: number;
  coaches: Coach[];
  studentCount?: number;
  photos: string[];
  coverImage?: string | null; // Partner-selected cover, or server fallback (first photo)
  createdAt: string;
  updatedAt: string;
}

export interface ChildProfile {
  id: string;
  parentId: number;
  childName: string;
  childAge: number;
  motherName?: string;
  fatherName: string;
  fatherContact?: string;
  address?: string;
  city?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string; // Student (enrollment) id
  academyId: string;
  childProfileId: string;
  academyName?: string;
  name: string;
  age: number;
  fatherName: string;
  fatherContact: string;
  enrollmentDate: string;
  status: 'active' | 'pending' | 'inactive';
}

export interface AttendanceRecord {
  studentId: string;
  date: string;
  present: boolean;
}

export interface Certificate {
  id: string;
  studentId: string;
  template: string;
  studentName: string;
  academyName: string;
  achievement: string;
  date: string;
  certificateNumber: string;
}

export interface Announcement {
  id: string;
  academyId: string;
  content: string;
  createdAt: string;
}

export interface DemoBooking {
  id: string;
  childProfileId: string;
  academyId: string;
  bookingDate: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
  academyName?: string;
  childName?: string;
}

export interface Review {
  id: string;
  academyId: string;
  childProfileId: string;
  parentId: number;
  rating: number;
  title?: string;
  comment: string;
  createdAt: string;
  childName?: string;
}
