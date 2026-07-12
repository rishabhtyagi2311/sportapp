import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { venueApiService } from '@/services/venueManagement/venue'

/* -------------------------------------------------------------------------- */
/* TYPES                                                                      */
/* -------------------------------------------------------------------------- */

export interface PartnerBooking {
  id: string
  venueId: string
  userId: string | null
  slotId: string | null
  date: string // YYYY-MM-DD
  startTime: string
  endTime: string
  totalAmount: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'pending' | 'paid' | 'refunded'
  bookingType: string
  participants: number
  guestName?: string
  guestPhone?: string
  guestDetails: {
    name: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

/* -------------------------------------------------------------------------- */
/* STATE INTERFACE                                                            */
/* -------------------------------------------------------------------------- */

interface PartnerBookingState {
  bookings: PartnerBooking[]
  isLoading: boolean
  error: string | null

  // ACTIONS: BOOKINGS (backend-owned state)
  fetchBookings: (venueId: string, date?: string) => Promise<void>
  cancelBooking: (venueId: string, bookingId: string) => Promise<void>

  // ACTIONS: SLOT BLOCKS (backend-owned state)
  addManualBlock: (payload: { venueId: string; slotId: string; reason: string; date?: string }) => Promise<void>
  removeManualBlock: (blockId: string) => Promise<void>

  // GETTERS
  getBookingById: (id: string) => PartnerBooking | undefined
  getBookingsForDate: (venueId: string, date: string) => PartnerBooking[]
}

/* -------------------------------------------------------------------------- */
/* STORE IMPLEMENTATION                                                       */
/* -------------------------------------------------------------------------- */

export const usePartnerBookingStore = create<PartnerBookingState>()(
  immer((set, get) => ({
    bookings: [],
    isLoading: false,
    error: null,

    fetchBookings: async (venueId, date) => {
      set({ isLoading: true, error: null })
      try {
        const response = await venueApiService.getBookings(venueId, date ? { date } : undefined)
        if (response.success) {
          set((state) => {
            state.bookings = response.data
            state.isLoading = false
          })
        }
      } catch (err: any) {
        set({ error: err.response?.data?.message || 'Failed to load bookings', isLoading: false })
      }
    },

    cancelBooking: async (venueId, bookingId) => {
      const response = await venueApiService.cancelBooking(venueId, bookingId)
      if (response.success) {
        set((state) => {
          const booking = state.bookings.find((b) => b.id === bookingId)
          if (booking) booking.status = 'cancelled'
        })
      }
    },

    addManualBlock: async (payload) => {
      await venueApiService.createBlock(payload)
    },

    removeManualBlock: async (blockId) => {
      await venueApiService.removeBlock(blockId)
    },

    getBookingById: (id) => get().bookings.find((b) => b.id === id),

    getBookingsForDate: (venueId, date) => {
      return get().bookings.filter((b) => b.venueId === venueId && b.date === date && b.status !== 'cancelled')
    },
  }))
)
