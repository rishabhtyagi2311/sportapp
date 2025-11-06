import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DemoBooking {
  id: string;
  childId: string;
  childName: string;
  fatherName: string;
  contactNumber: string;
  academyId: string;
  academyName: string;
  bookingDate: string; // ISO string of the scheduled demo date
  status: 'confirmed' | 'completed' | 'cancelled';
  createdAt: string;
}

interface DemoBookingStore {
  demoBookings: DemoBooking[];
  addDemoBooking: (booking: Omit<DemoBooking, 'id' | 'createdAt'>) => void;
  updateDemoBookingStatus: (id: string, status: DemoBooking['status']) => void;
  getBookingsByChildId: (childId: string) => DemoBooking[];
  getBookingsByAcademyId: (academyId: string) => DemoBooking[];
  isDemoBooked: (childId: string, academyId: string) => boolean;
}

export const useDemoBookingStore = create<DemoBookingStore>()(
  persist(
    (set, get) => ({
      demoBookings: [],
      
      addDemoBooking: (booking) => 
        set((state) => ({
          demoBookings: [
            ...state.demoBookings,
            {
              ...booking,
              id: `demo-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              createdAt: new Date().toISOString(),
            }
          ]
        })),
        
      updateDemoBookingStatus: (id, status) =>
        set((state) => ({
          demoBookings: state.demoBookings.map((booking) => 
            booking.id === id ? { ...booking, status } : booking
          )
        })),
        
      getBookingsByChildId: (childId) => {
        const { demoBookings } = get();
        return demoBookings.filter((booking) => booking.childId === childId);
      },
      
      getBookingsByAcademyId: (academyId) => {
        const { demoBookings } = get();
        return demoBookings.filter((booking) => booking.academyId === academyId);
      },
      
      isDemoBooked: (childId, academyId) => {
        const { demoBookings } = get();
        return demoBookings.some(
          (booking) => 
            booking.childId === childId && 
            booking.academyId === academyId && 
            booking.status !== 'cancelled'
        );
      },
    }),
    {
      name: 'demo-bookings-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);