import { Academy, Student } from '../types';

export const dummyAcademies: Academy[] = [
  {
    id: '1',
    academyName: 'Champions Cricket Academy',
    sportType: 'Cricket',
    address: '123 Sports Complex, Sector 15',
    coachName: 'Rajesh Kumar',
    contactNumber: '+91-9876543210',
    facilities: 'Indoor Nets, Outdoor Ground, Gym',
   
    Fee: '5000',
    city: 'Ghaziabad',
    headCoach: 'Rajesh Kumar',
    coaches: [
      { id: '1', name: 'Rajesh Kumar', specialization: 'Batting', experience: '8 years', contact: '+91-9876543210' },
      { id: '2', name: 'Suresh Patel', specialization: 'Bowling', experience: '6 years', contact: '+91-9876543211' }
    ],
   
  },
  {
    id: '2',
    academyName: 'Elite Football Academy',
    sportType: 'Football',
    address: '456 Ground View, Sector 22',
    coachName: 'Michael Silva',
    contactNumber: '+91-9876543212',
    facilities: 'FIFA Standard Ground, Gymnasium',
  
    Fee: '4500',
    city: 'Ghaziabad',
    headCoach: 'Michael Silva',
    coaches: [
      { id: '3', name: 'Michael Silva', specialization: 'Goalkeeper Training', experience: '10 years', contact: '+91-9876543212' },
      { id: '4', name: 'Ravi Sharma', specialization: 'Defense', experience: '7 years', contact: '+91-9876543213' }
    ],
   
  }
];

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