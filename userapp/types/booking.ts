// types/booking.ts
export interface Amenity {
  id: string;
  name: string;
  category: 'basic' | 'sports_equipment' | 'facilities' | 'services';
  icon?: string; // For UI display
  description?: string;
}

// Sport variety interface for different types/formats within a sport
export interface SportVariety {
  id: string;
  name: string; // e.g., "6x6 Turf", "7x7 Turf", "Full Court", "Half Court"
  description?: string; // Optional detailed description
  specifications?: {
    dimensions?: string; // e.g., "60ft x 40ft"
    capacity?: number; // max players
    surface?: string; // e.g., "Artificial Turf", "Concrete", "Wooden"
    [key: string]: any; // Allow additional specifications
  };
  basePrice?: number; // Base price for this variety (can override sport base price)
  isAvailable: boolean;
}

export interface SportDetail {
  id: string;
  sportType: string;
  specifications: Record<string, any>; // Flexible key-value pairs for sport-specific details
}

export interface Sport {
  id: string;
  name: string;
  category: 'indoor' | 'outdoor';
  varieties: SportVariety[]; // Different formats/types available for this sport
  details?: SportDetail[]; // Array of sport-specific configurations (kept for backward compatibility)
  basePrice?: number; // Default base price for the sport
}

export interface TimeSlot {
  id: string;
  sportId?: string; // Reference to Sport
  sportVarietyId?: string; // Reference to specific SportVariety
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  isAvailable: boolean;
  price: number;
  priceType: 'per_hour' | 'per_slot' | 'per_person';
}

export interface Venue {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };
  contactInfo: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  sports: Sport[]; // Multiple sports supported with varieties
  amenities: Amenity[]; // Dynamic list of amenities
  images: string[]; // Array of image URLs
  rating: number;
  reviewCount: number;
  operatingHours: {
    [key: string]: { // day of week
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  timeSlots: TimeSlot[];
  policies: {
    cancellationPolicy: string;
    advanceBookingDays: number;
    minimumBookingHours: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface Event {
  id: string;
  creatorId: string;
  venueId: string;
  name: string;
  description?: string;

  eventType: 'footballtournament' | 'regular'  ;

  // 🔹 TOURNAMENT-ONLY FIELDS
  tournamentFormat?: 'league' | 'knockout';
  maxRegistrations?: number;

  sport: Sport;
  sportVarietyId?: string;

  participationType: 'individual' | 'team';
  teamSize?: number;

  maxParticipants: number;        // FINAL teams
  currentParticipants: number;

  dateTime: string;
  duration: number;

  fees: {
    amount: number;
    currency: 'INR';
    type: 'per_person' | 'per_team' | 'total';
  };

  organizer: {
    name: string;
    contact: string;
  };

  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isPublic: boolean;
  registrationDeadline: string;
  createdAt: string;
  updatedAt: string;
}


export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  sportId?: string; // Reference to booked sport
  sportVarietyId?: string; // Reference to specific sport variety being booked
  eventId?: string; // Optional if it's an event booking
  bookingType: 'venue' | 'event';
  date: string; // YYYY-MM-DD format
  timeSlots: TimeSlot[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  participants: number;
  specialRequests?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookingState {
  venues: Venue[];
  events: Event[];
  bookings: Booking[];
  amenities: Amenity[]; // Master list of all possible amenities
  sports: Sport[]; // Master list of all sports with varieties
  
  // Loading states
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setVenues: (venues: Venue[]) => void;
  addVenue: (venue: Venue) => void;
  updateVenue: (id: string, venue: Partial<Venue>) => void;
  deleteVenue: (id: string) => void;
  
  setEvents: (events: Event[]) => void;
  addEvent: (event: Event) => void;
  updateEvent: (id: string, event: Partial<Event>) => void;
  deleteEvent: (id: string) => void;
  
  setBookings: (bookings: Booking[]) => void;
  addBooking: (booking: Booking) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  
  // Utility actions
  getVenueById: (id: string) => Venue | undefined;
  getEventById: (id: string) => Event | undefined;
  getEventsByVenue: (venueId: string) => Event[];
  getVenuesBySport: (sportId: string) => Venue[];
  getVenuesBySportVariety: (sportId: string, varietyId: string) => Venue[]; // New utility
  getSportVarietiesBySport: (sportId: string) => SportVariety[]; // New utility
  
  // Filters
  searchVenues: (query: string, filters?: VenueFilters) => Venue[];
  searchEvents: (query: string, filters?: EventFilters) => Event[];
}

export interface VenueFilters {
  sports?: string[];
  sportVarieties?: string[]; // New filter for sport varieties
  amenities?: string[];
  city?: string;
  priceRange?: {
    min: number;
    max: number;
  };
  rating?: number;
  availability?: {
    date: string;
    timeSlot: string;
  };
}

export interface EventFilters {
  sports?: string[];
  sportVarieties?: string[]; // New filter for sport varieties
  eventType?: string[];
  participationType?: 'individual' | 'team';
  dateRange?: {
    start: string;
    end: string;
  };
  feeRange?: {
    min: number;
    max: number;
  };
  city?: string;
}

// Helper types for better TypeScript support
export interface BookingRequest {
  venueId: string;
  sportId?: string;
  sportVarietyId?: string; // Specific variety being booked
  timeSlotIds: string[];
  customerInfo: {
    name: string;
    phone: string;
    email?: string;
  };
  totalAmount: number;
}

// Helper type to get available varieties for a specific sport at a venue
export type SportWithVarieties = Sport & {
  availableVarieties: SportVariety[];
};