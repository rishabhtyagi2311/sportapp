// types.ts

export type Academy = {
  id: string;
  academyName: string;
  sportType: string;
  address: string;
  coachName: string;
  contactNumber: string;
  facilities: string;
  
  Fee: string; // Note: You capitalize 'Fee' here, ensuring it matches your usage
  city: string;
  coaches?: Coach[];
  headCoach?: string;
  
  // ✅ Added for the Gallery feature
  photos?: string[]; 
};

export type Coach = {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  contact: string;
};

export type Student = {
  id: string;
  name: string;
  age: number;
  fatherName: string;
  fatherContact: string;
  academyId: string;
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