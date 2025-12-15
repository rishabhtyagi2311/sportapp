// types/venue.ts

/* -------------------------------------------------------------------------- */
/* SUB-ENTITIES                                */
/* -------------------------------------------------------------------------- */

export interface Amenity {
  id: string;
  name: string;
  category: 'basic' | 'sports_equipment' | 'facilities' | 'services';
  icon?: string;
  description?: string;
}

export interface SportVariety {
  id: string;
  name: string; // e.g., "6x6 Turf", "Full Court"
  specifications?: Record<string, any>;
  basePrice?: number;
  isAvailable: boolean;
}

export interface Sport {
  id: string;
  name: string;
  category: 'indoor' | 'outdoor';
  varieties: SportVariety[];
}

export interface TimeSlot {
  id: string;
  sportId?: string;       // Optional: Link slot to specific sport
  sportVarietyId?: string;// Optional: Link slot to specific variety
  startTime: string;      // HH:mm
  endTime: string;        // HH:mm
  isAvailable: boolean;
  price: number;
  priceType: 'per_hour' | 'per_slot' | 'per_person';
}

export interface OperatingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export type WeeklyOperatingHours = {
  [key in 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday']: OperatingHours;
};

/* -------------------------------------------------------------------------- */
/* MAIN ENTITY                                 */
/* -------------------------------------------------------------------------- */

export interface VenueAddress {
  street: string;
  city: string;
  state: string;
  pincode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Venue {
  id: string;
  name: string;
  address: VenueAddress;
  contactInfo: {
    phone: string;
    email?: string;
    whatsapp?: string;
  };
  
  // Relations
  sports: Sport[];        // Sports available at this venue
  amenities: Amenity[];   // Amenities available at this venue
  
  // Content
  images: string[];
  rating: number;
  reviewCount: number;
  
  // Logic
  operatingHours: WeeklyOperatingHours;
  timeSlots: TimeSlot[];
  policies: {
    cancellationPolicy: string;
    advanceBookingDays: number;
    minimumBookingHours: number;
  };
  
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  description : string;
}

/* -------------------------------------------------------------------------- */
/* FILTERS                                   */
/* -------------------------------------------------------------------------- */

export interface VenueFilters {
  searchQuery?: string;
  sports?: string[];
  amenities?: string[];
  city?: string;
  rating?: number;
  isActive?: boolean;
}

/* -------------------------------------------------------------------------- */
/* INPUTS                                    */
/* -------------------------------------------------------------------------- */

// Helper type for creating a new venue (omitting system generated fields)
export type CreateVenueInput = Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>;