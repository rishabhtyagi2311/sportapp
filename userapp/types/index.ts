export type Academy = {
  id: string;
  academyName: string;
  sportType: string;
  address: string;
  coachName: string;
  contactNumber: string;
  facilities: string;
  feeStructure: string;
  Fee: string;
  city: string;
  coaches?: Coach[];
  headCoach?: string;
  
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