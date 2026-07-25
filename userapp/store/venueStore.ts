import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import {
  Venue,
  Booking,
  VenueFilters,
  Sport,
  Amenity,
} from '@/types/booking';
import { venueApiService } from '@/services/venue/venue';

export interface BookingStoreState {
  venues: Venue[];
  bookings: Booking[];
  amenities: Amenity[];
  sports: Sport[];
  isLoading: boolean;
  error: string | null;

  /* Actions */
  setVenues: (venues: Venue[]) => void;
  setAmenities: (amenities: Amenity[]) => void;
  setSports: (sports: Sport[]) => void;

  /* Server-backed venue fetching */
  fetchVenues: (filters?: { city?: string }) => Promise<void>;
  fetchVenueById: (id: string) => Promise<Venue | null>;

  /* Read / Search */
  getVenueById: (id: string) => Venue | undefined;
  searchVenues: (query: string, filters?: VenueFilters) => Venue[];
}

/** Derives the filter-modal's master sports/amenities lists from whatever
 *  venues are actually live, since there's no separate taxonomy endpoint.
 *  Defensive about shape — a venue's `sports`/`amenities` are raw JSON set by
 *  whichever partner created it, so entries might be plain strings rather
 *  than the full `Sport`/`Amenity` object shape. */
function deriveFilterOptions(venues: Venue[]) {
  const sportsById = new Map<string, Sport>();
  const amenitiesById = new Map<string, Amenity>();

  for (const venue of venues) {
    for (const sport of (venue.sports || []) as any[]) {
      if (typeof sport === 'string') {
        sportsById.set(sport, { id: sport, name: sport, category: 'outdoor', varieties: [] });
      } else if (sport?.id) {
        sportsById.set(sport.id, sport);
      }
    }
    for (const amenity of (venue.amenities || []) as any[]) {
      if (typeof amenity === 'string') {
        amenitiesById.set(amenity, { id: amenity, name: amenity, category: 'basic' });
      } else if (amenity?.id) {
        amenitiesById.set(amenity.id, amenity);
      }
    }
  }

  return { sports: Array.from(sportsById.values()), amenities: Array.from(amenitiesById.values()) };
}

export const useBookingStore = create<BookingStoreState>()(
  devtools(
    immer((set, get) => ({
      venues: [],
      bookings: [],
      amenities: [],
      sports: [],
      isLoading: false,
      error: null,

      setVenues: (venues) =>
        set((state) => { state.venues = venues; }),
      setAmenities: (amenities) =>
        set((state) => { state.amenities = amenities; }),
      setSports: (sports) =>
        set((state) => { state.sports = sports; }),

      /* ---------- SERVER-BACKED FETCHING ---------- */
      fetchVenues: async (filters) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const response = await venueApiService.getVenues(filters);
          const { sports, amenities } = deriveFilterOptions(response.data);
          set((state) => {
            state.venues = response.data;
            state.sports = sports;
            state.amenities = amenities;
            state.isLoading = false;
          });
        } catch (err: any) {
          const message = err.response?.data?.message || 'Could not load venues';
          set((state) => { state.error = message; state.isLoading = false; });
          throw new Error(message);
        }
      },

      fetchVenueById: async (id) => {
        set((state) => { state.isLoading = true; state.error = null; });
        try {
          const response = await venueApiService.getVenueById(id);
          set((state) => {
            const index = state.venues.findIndex((v) => v.id === id);
            if (index !== -1) {
              state.venues[index] = response.data;
            } else {
              state.venues.push(response.data);
            }
            state.isLoading = false;
          });
          return response.data;
        } catch (err: any) {
          const message = err.response?.data?.message || 'Could not load venue';
          set((state) => { state.error = message; state.isLoading = false; });
          return null;
        }
      },

      /* ---------- READ & SEARCH ---------- */
      getVenueById: (id) => get().venues.find((v) => v.id === id),

      searchVenues: (query, filters) => {
        let results = get().venues;
        if (query.trim()) {
          const q = query.toLowerCase();
          results = results.filter(
            (v) =>
              v.name.toLowerCase().includes(q) ||
              v.address.city.toLowerCase().includes(q)
          );
        }
        if (filters?.city) {
          results = results.filter((v) => v.address.city.toLowerCase() === filters.city!.toLowerCase());
        }
        if (filters?.sports?.length) {
          results = results.filter((v) => v.sports.some((s) => filters.sports!.includes(s.id)));
        }
        return results;
      },
    })),
    { name: 'booking-store' }
  )
);