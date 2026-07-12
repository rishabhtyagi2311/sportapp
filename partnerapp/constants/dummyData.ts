import { Student } from '../types';

export const dummyStudents: Student[] = [
  {
    id: '1',
    name: 'Arjun Gupta',
    age: 14,
    fatherName: 'Ramesh Gupta',
    fatherContact: '+91-9876541234',
    academyId: '1',
    enrollmentDate: '2024-01-15'
  },
  {
    id: '2',
    name: 'Priya Sharma',
    age: 12,
    fatherName: 'Sunil Sharma',
    fatherContact: '+91-9876541235',
    academyId: '1',
    enrollmentDate: '2024-02-01'
  },
  {
    id: '3',
    name: 'Rohit Singh',
    age: 16,
    fatherName: 'Vijay Singh',
    fatherContact: '+91-9876541236',
    academyId: '2',
    enrollmentDate: '2024-01-20'
  }
];

export const certificateTemplates = [
  { id: 'achievement', name: 'Achievement Certificate', color: '#FFD700' },
  { id: 'participation', name: 'Participation Certificate', color: '#87CEEB' },
  { id: 'excellence', name: 'Excellence Certificate', color: '#FF6347' }
];