/**
 * Professional Venue Service
 * Handles Venue lifecycle and automated TimeSlot generation
 */
export declare class VenueService {
    /**
     * Reshapes the flat Prisma Venue row (+ address/images/_count relations)
     * into the nested shape the frontend `Venue` type expects. The DB keeps
     * city/state/pincode on the venue row and street/lat/lng on a separate
     * Address row; the client always wants one nested `address` object.
     */
    static mapVenueForClient(venue: any): {
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    };
    static createVenue(data: any, partnerId: string): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    static getVenuesByPartner(partnerId: string): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    static getVenueById(venueId: string, partnerId: string): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
    static updateVenue(venueId: string, partnerId: string, data: any): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }>;
    static deleteVenue(venueId: string, partnerId: string): Promise<void>;
    /** Public, unauthenticated browse — no partnerId scoping, active venues only. */
    static getPublicVenues(filters?: {
        city?: string;
    }): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    }[]>;
    static getPublicVenueById(venueId: string): Promise<{
        id: any;
        name: any;
        description: any;
        address: {
            coordinates?: {
                latitude: any;
                longitude: any;
            } | undefined;
            street: any;
            city: any;
            state: any;
            pincode: any;
        };
        contactInfo: any;
        sports: any;
        amenities: any;
        images: any;
        rating: any;
        reviewCount: number;
        operatingHours: any;
        peakPricing: any;
        timeSlots: any;
        timeSlotCount: any;
        policies: {
            cancellationPolicy: string;
            advanceBookingDays: number;
            minimumBookingHours: number;
        };
        isActive: any;
        createdAt: any;
        updatedAt: any;
    } | null>;
}
//# sourceMappingURL=venue.d.ts.map