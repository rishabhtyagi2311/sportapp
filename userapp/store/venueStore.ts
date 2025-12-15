import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import {
  Venue,
  Event,
  Booking,
  VenueFilters,
  EventFilters,
  Sport,
  Amenity,
  TimeSlot,
} from '@/types/booking'

/* -------------------------------------------------------------------------- */
/*                                  STATE                                     */
/* -------------------------------------------------------------------------- */

export interface BookingStoreState {
  // Public catalog
  venues: Venue[]
  events: Event[]
  bookings: Booking[]

  // Master data
  amenities: Amenity[]
  sports: Sport[]

  // UI state
  isLoading: boolean
  error: string | null

  /* ----------------------------- SETTERS ----------------------------- */
  setVenues: (venues: Venue[]) => void
  setEvents: (events: Event[]) => void
  setAmenities: (amenities: Amenity[]) => void
  setSports: (sports: Sport[]) => void

  /* ----------------------------- EVENTS (SNAPSHOT) ----------------------------- */
  addEvent: (event: Event) => void
  updateEvent: (id: string, update: Partial<Event>) => void
  deleteEvent: (id: string) => void

  /* ----------------------------- READ ----------------------------- */
  getVenueById: (id: string) => Venue | undefined
  getEventById: (id: string) => Event | undefined
  getEventsByVenue: (venueId: string) => Event[]

  /* ----------------------------- SEARCH ----------------------------- */
  searchVenues: (query: string, filters?: VenueFilters) => Venue[]
  searchEvents: (query: string, filters?: EventFilters) => Event[]
}

/* -------------------------------------------------------------------------- */
/*                                   STORE                                    */
/* -------------------------------------------------------------------------- */

export const useBookingStore = create<BookingStoreState>()(
  devtools(
    immer((set, get) => ({
      /* ---------- INITIAL STATE ---------- */
      venues: [],
      events: [],
      bookings: [],
      amenities: [],
      sports: [],
      isLoading: false,
      error: null,

      /* ---------- SETTERS ---------- */
      setVenues: (venues) =>
        set((state) => {
          state.venues = venues
          state.isLoading = false
          state.error = null
        }),

      setEvents: (events) =>
        set((state) => {
          state.events = events
          state.isLoading = false
          state.error = null
        }),

      setAmenities: (amenities) =>
        set((state) => {
          state.amenities = amenities
        }),

      setSports: (sports) =>
        set((state) => {
          state.sports = sports
        }),

      /* ---------- EVENT SNAPSHOT (FROM MANAGER) ---------- */
      addEvent: (event) =>
        set((state) => {
          state.events.push(event)
        }),

      updateEvent: (id, update) =>
        set((state) => {
          const index = state.events.findIndex((e) => e.id === id)
          if (index !== -1) {
            state.events[index] = {
              ...state.events[index],
              ...update,
              updatedAt: new Date().toISOString(),
            }
          }
        }),

      deleteEvent: (id) =>
        set((state) => {
          state.events = state.events.filter((e) => e.id !== id)
        }),

      /* ---------- READ ---------- */
      getVenueById: (id) =>
        get().venues.find((v) => v.id === id),

      getEventById: (id) =>
        get().events.find((e) => e.id === id),

      getEventsByVenue: (venueId) =>
        get().events.filter((e) => e.venueId === venueId),

      /* ---------- SEARCH VENUES ---------- */
      searchVenues: (query, filters) => {
        let results = get().venues

        if (query.trim()) {
          const q = query.toLowerCase()
          results = results.filter(
            (v) =>
              v.name.toLowerCase().includes(q) ||
              v.address.city.toLowerCase().includes(q)
          )
        }

        if (filters?.city) {
          results = results.filter(
            (v) =>
              v.address.city.toLowerCase() === filters.city!.toLowerCase()
          )
        }

        if (filters?.sports?.length) {
          results = results.filter((v) =>
            v.sports.some((s) => filters.sports!.includes(s.id))
          )
        }

        return results
      },

      /* ---------- SEARCH EVENTS ---------- */
      searchEvents: (query, filters) => {
        let results = get().events

        if (query.trim()) {
          const q = query.toLowerCase()
          results = results.filter(
            (e) =>
              e.name.toLowerCase().includes(q) ||
              e.sport.name.toLowerCase().includes(q) ||
              e.description?.toLowerCase().includes(q)
          )
        }

        if (filters?.sports?.length) {
          results = results.filter((e) =>
            filters.sports!.includes(e.sport.id)
          )
        }

        if (filters?.eventType?.length) {
          results = results.filter((e) =>
            filters.eventType!.includes(e.eventType)
          )
        }

        if (filters?.participationType) {
          results = results.filter(
            (e) => e.participationType === filters.participationType
          )
        }

        if (filters?.feeRange) {
          const { min, max } = filters.feeRange

          results = results.filter(
            (e) => e.fees.amount >= min && e.fees.amount <= max
          )
        }

        return results
      },
    })),
    { name: 'booking-store' }
  )
)
