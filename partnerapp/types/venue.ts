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
  category: 'indoor' | 'outdoor' | 'N/A';
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

/* -------------------------------------------------------------------------- */
/* PERSISTED SLOT (as returned by GET /venues/:venueId/slots)                 */
/* -------------------------------------------------------------------------- */

export type SlotStatus = 'available' | 'booked' | 'blocked' | 'match_session';

export interface VenueSlot {
  id: string;
  venueId: string;
  varietyId: string;
  varietyName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
  status: SlotStatus;
  blockId?: string;
  blockReason?: string;
}

export interface OperatingHours {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface PeakPricingRule {
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number;
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
  coverImage?: string | null;
  rating: number;
  reviewCount: number;
  
  // Logic
  operatingHours: WeeklyOperatingHours;
  peakPricing?: PeakPricingRule;
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
  timeSlotCount?: number;
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

export type CreateVenueInput = Omit<Venue, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount' | 'coverImage'> & {
  // Write-side field name — matches the server's create/update payload.
  // Reads come back as `coverImage` on `Venue` instead (see above).
  coverImageUrl?: string | null;
};