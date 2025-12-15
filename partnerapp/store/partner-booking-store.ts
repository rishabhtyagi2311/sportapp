import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { Booking as BaseBooking } from '@/types/booking' 

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

// 1. Extended Booking Type (Includes Guest Info)
export interface PartnerBooking extends BaseBooking {
  guestDetails: {
    name: string
    phone: string
  }
}

// 2. Manual Block Type (For Owner Overrides)
export interface ManualBlock {
  id: string
  venueId: string
  date: string // YYYY-MM-DD
  slotId: string
  reason: string
  createdAt: string
}

/* -------------------------------------------------------------------------- */
/* STATE INTERFACE                                                            */
/* -------------------------------------------------------------------------- */

interface PartnerBookingState {
  // DATA
  bookings: PartnerBooking[]
  manualBlocks: ManualBlock[]
  
  // ACTIONS: SLOT MANAGEMENT (Restored!)
  addManualBlock: (block: Omit<ManualBlock, 'id' | 'createdAt'>) => void
  removeManualBlock: (blockId: string) => void
  
  // ACTIONS: BOOKING MANAGEMENT
  cancelBooking: (bookingId: string) => void
  
  // GETTERS
  getBookingById: (id: string) => PartnerBooking | undefined
  getBookingsForDate: (venueId: string, date: string) => PartnerBooking[]
  getBlocksForDate: (venueId: string, date: string) => ManualBlock[]
}

/* -------------------------------------------------------------------------- */
/* STORE IMPLEMENTATION                                                       */
/* -------------------------------------------------------------------------- */

export const usePartnerBookingStore = create<PartnerBookingState>()(
  immer((set, get) => ({
    
    // --- MOCK DATA ---
    bookings: [
      {
        id: 'b_123',
        venueId: 'v1',
        userId: 'u_99',
        date: new Date().toISOString().split('T')[0], // Today
        timeSlots: [{ 
          id: 'ts1', startTime: '10:00', endTime: '11:00', price: 500, isAvailable: false, priceType: 'per_slot' 
        }],
        sportId: 's1',
        totalAmount: 500,
        status: 'confirmed',
        paymentStatus: 'paid',
        bookingType: 'venue',
        participants: 12,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guestDetails: { name: 'Rahul Sharma', phone: '+91 98765 43210' }
      },
      {
        id: 'b_124',
        venueId: 'v1',
        userId: 'u_100',
        date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        timeSlots: [{ 
          id: 'ts2', startTime: '18:00', endTime: '19:00', price: 800, isAvailable: false, priceType: 'per_slot' 
        }],
        sportId: 's2',
        totalAmount: 800,
        status: 'pending',
        paymentStatus: 'pending',
        bookingType: 'venue',
        participants: 14,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        guestDetails: { name: 'Amit Verma', phone: '+91 99887 76655' }
      }
    ] as PartnerBooking[],

    manualBlocks: [], // Starts empty

    // --- SLOT ACTIONS ---

    addManualBlock: (block) => set((state) => {
      state.manualBlocks.push({
        ...block,
        id: Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString()
      })
    }),

    removeManualBlock: (blockId) => set((state) => {
      state.manualBlocks = state.manualBlocks.filter(b => b.id !== blockId)
    }),

    // --- BOOKING ACTIONS ---

    cancelBooking: (id) => set((state) => {
      const booking = state.bookings.find(b => b.id === id)
      if (booking) booking.status = 'cancelled'
    }),

    // --- GETTERS ---

    getBookingById: (id) => get().bookings.find(b => b.id === id),

    getBookingsForDate: (venueId, date) => {
      return get().bookings.filter(b => 
        b.venueId === venueId && 
        b.date === date && 
        b.status !== 'cancelled'
      )
    },

    getBlocksForDate: (venueId, date) => {
      return get().manualBlocks.filter(b => b.venueId === venueId && b.date === date)
    }

  }))
)