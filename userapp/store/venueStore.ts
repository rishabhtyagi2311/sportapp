// stores/bookingStore.ts

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import { BookingState, Venue, Event, Booking, VenueFilters, EventFilters, Sport, Amenity, TimeSlot } from '../types/booking';

export const useBookingStore = create<BookingState>()(
  devtools(
    persist(
      immer((set, get) => ({
        venues: [],
        events: [],
        bookings: [],
        amenities: [],
        sports: [],
        isLoading: false,
        error: null,

        // Venue actions
        setVenues: (venues: Venue[]) => set((state) => {
          state.venues = venues;
          state.isLoading = false;
          state.error = null;
        }),

        addVenue: (venue: Venue) => set((state) => {
          state.venues.push(venue);
        }),

        updateVenue: (id: string, venueUpdate: Partial<Venue>) => set((state) => {
          const index = state.venues.findIndex((v: Venue) => v.id === id);
          if (index !== -1) {
            state.venues[index] = { ...state.venues[index], ...venueUpdate };
            state.venues[index].updatedAt = new Date().toISOString();
          }
        }),

        deleteVenue: (id: string) => set((state) => {
          state.venues = state.venues.filter((v: Venue) => v.id !== id);
          // Also remove related events
          state.events = state.events.filter((e: Event) => e.venueId !== id);
          // Also remove related bookings
          state.bookings = state.bookings.filter((b: Booking) => b.venueId !== id);
        }),

        // Event actions
        setEvents: (events: Event[]) => set((state) => {
          state.events = events;
          state.isLoading = false;
          state.error = null;
        }),

        addEvent: (event: Event) => set((state) => {
          state.events.push(event);
        }),

        updateEvent: (id: string, eventUpdate: Partial<Event>) => set((state) => {
          const index = state.events.findIndex((e: Event) => e.id === id);
          if (index !== -1) {
            state.events[index] = { ...state.events[index], ...eventUpdate };
            state.events[index].updatedAt = new Date().toISOString();
          }
        }),

        deleteEvent: (id: string) => set((state) => {
          state.events = state.events.filter((e: Event) => e.id !== id);
          // Also remove related bookings
          state.bookings = state.bookings.filter((b: Booking) => b.eventId !== id);
        }),

        // Booking actions
        setBookings: (bookings: Booking[]) => set((state) => {
          state.bookings = bookings;
          state.isLoading = false;
          state.error = null;
        }),

        addBooking: (booking: Booking) => set((state) => {
          state.bookings.push(booking);
        }),

        updateBooking: (id: string, bookingUpdate: Partial<Booking>) => set((state) => {
          const index = state.bookings.findIndex((b: Booking) => b.id === id);
          if (index !== -1) {
            state.bookings[index] = { ...state.bookings[index], ...bookingUpdate };
            state.bookings[index].updatedAt = new Date().toISOString();
          }
        }),

        // Utility actions
        getVenueById: (id: string) => {
          return get().venues.find((v: Venue) => v.id === id);
        },

        getEventById: (id: string) => {
          return get().events.find((e: Event) => e.id === id);
        },

        getEventsByVenue: (venueId: string) => {
          return get().events.filter((e: Event) => e.venueId === venueId);
        },

        getVenuesBySport: (sportId: string) => {
          return get().venues.filter((v: Venue) => 
            v.sports.some((sport: Sport) => sport.id === sportId)
          );
        },

        // Search and filter functions
        searchVenues: (query: string, filters?: VenueFilters) => {
          const venues = get().venues;
          let filteredVenues = venues;

          // Text search
          if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredVenues = filteredVenues.filter((venue: Venue) =>
              venue.name.toLowerCase().includes(searchTerm) ||
              venue.address.city.toLowerCase().includes(searchTerm) ||
              venue.sports.some((sport: Sport) => 
                sport.name.toLowerCase().includes(searchTerm)
              )
            );
          }

          // Apply filters
          if (filters) {
            if (filters.sports && filters.sports.length > 0) {
              filteredVenues = filteredVenues.filter((venue: Venue) =>
                venue.sports.some((sport: Sport) => 
                  filters.sports!.includes(sport.id)
                )
              );
            }

            if (filters.amenities && filters.amenities.length > 0) {
              filteredVenues = filteredVenues.filter((venue: Venue) =>
                filters.amenities!.every((amenityId: string) =>
                  venue.amenities.some((amenity: Amenity) => amenity.id === amenityId)
                )
              );
            }

            if (filters.city) {
              filteredVenues = filteredVenues.filter((venue: Venue) =>
                venue.address.city.toLowerCase() === filters.city!.toLowerCase()
              );
            }

            if (filters.rating) {
              filteredVenues = filteredVenues.filter((venue: Venue) =>
                venue.rating >= filters.rating!
              );
            }

            if (filters.priceRange) {
              filteredVenues = filteredVenues.filter((venue: Venue) =>
                venue.timeSlots.some((slot: TimeSlot) =>
                  slot.price >= filters.priceRange!.min &&
                  slot.price <= filters.priceRange!.max
                )
              );
            }
          }

          return filteredVenues;
        },

        searchEvents: (query: string, filters?: EventFilters) => {
          const events = get().events;
          let filteredEvents = events;

          // Text search
          if (query.trim()) {
            const searchTerm = query.toLowerCase();
            filteredEvents = filteredEvents.filter((event: Event) =>
              event.name.toLowerCase().includes(searchTerm) ||
              event.sport.name.toLowerCase().includes(searchTerm) ||
              event.description?.toLowerCase().includes(searchTerm)
            );
          }

          // Apply filters
          if (filters) {
            if (filters.sports && filters.sports.length > 0) {
              filteredEvents = filteredEvents.filter((event: Event) =>
                filters.sports!.includes(event.sport.id)
              );
            }

            if (filters.eventType && filters.eventType.length > 0) {
              filteredEvents = filteredEvents.filter((event: Event) =>
                filters.eventType!.includes(event.eventType)
              );
            }

            if (filters.participationType) {
              filteredEvents = filteredEvents.filter((event: Event) =>
                event.participationType === filters.participationType
              );
            }

            if (filters.dateRange) {
              const startDate = new Date(filters.dateRange.start);
              const endDate = new Date(filters.dateRange.end);
              filteredEvents = filteredEvents.filter((event: Event) => {
                const eventDate = new Date(event.dateTime);
                return eventDate >= startDate && eventDate <= endDate;
              });
            }

            if (filters.feeRange) {
              filteredEvents = filteredEvents.filter((event: Event) =>
                event.fees.amount >= filters.feeRange!.min &&
                event.fees.amount <= filters.feeRange!.max
              );
            }

            if (filters.city) {
              const venues = get().venues;
              const venueIds = venues
                .filter((v: Venue) => v.address.city.toLowerCase() === filters.city!.toLowerCase())
                .map((v: Venue) => v.id);
              filteredEvents = filteredEvents.filter((event: Event) =>
                venueIds.includes(event.venueId)
              );
            }
          }

          return filteredEvents;
        },
      })),
      {
        name: 'booking-store', // Name for localStorage
        partialize: (state) => ({
          // Only persist data, not loading states
          venues: state.venues,
          events: state.events,
          bookings: state.bookings,
          amenities: state.amenities,
          sports: state.sports,
        }),
      }
    ),
    {
      name: 'booking-store', // Name for devtools
    }
  )
);