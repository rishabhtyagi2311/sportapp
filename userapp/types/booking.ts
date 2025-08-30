// types/booking.ts

export interface Amenity {
  id: string;
  name: string;
  category: 'basic' | 'sports_equipment' | 'facilities' | 'services';
  icon?: string; // For UI display
  description?: string;
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
  details?: SportDetail[]; // Array of sport-specific configurations
}

export interface TimeSlot {
  id: string;
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
  sports: Sport[]; // Multiple sports supported
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
  venueId: string;
  name: string;
  description?: string;
  eventType: 'tournament' | 'practice' | 'friendly' | 'training' | 'league';
  sport: Sport;
  participationType: 'individual' | 'team';
  teamSize?: number; // Required if participationType is 'team'
  maxParticipants: number;
  currentParticipants: number;
  dateTime: string; // ISO string
  duration: number; // in hours
  fees: {
    amount: number;
    currency: 'INR';
    type: 'per_person' | 'per_team' | 'total';
  };
  organizer: {
    name: string;
    contact: string;
  };
  requirements?: string[]; // Equipment, skill level, etc.
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  isPublic: boolean;
  registrationDeadline: string; // ISO string
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
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
  sports: Sport[]; // Master list of all sports
  
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
  
  // Filters
  searchVenues: (query: string, filters?: VenueFilters) => Venue[];
  searchEvents: (query: string, filters?: EventFilters) => Event[];
}

export interface VenueFilters {
  sports?: string[];
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