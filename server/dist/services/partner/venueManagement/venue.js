"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VenueService = void 0;
const index_1 = require("../../../index");
const slotGenerator_1 = require("./slotGenerator");
/**
 * Professional Venue Service
 * Handles Venue lifecycle and automated TimeSlot generation
 */
class VenueService {
    /**
     * Reshapes the flat Prisma Venue row (+ address/images/_count relations)
     * into the nested shape the frontend `Venue` type expects. The DB keeps
     * city/state/pincode on the venue row and street/lat/lng on a separate
     * Address row; the client always wants one nested `address` object.
     */
    static mapVenueForClient(venue) {
        return {
            id: venue.id,
            name: venue.name,
            description: venue.description,
            address: {
                street: venue.address?.street || '',
                city: venue.city,
                state: venue.state,
                pincode: venue.pincode,
                ...(venue.address?.lat != null && venue.address?.lng != null
                    ? { coordinates: { latitude: venue.address.lat, longitude: venue.address.lng } }
                    : {}),
            },
            contactInfo: venue.contactInfo,
            sports: venue.sports,
            amenities: venue.amenities,
            images: (venue.images || []).map((img) => img.url),
            rating: venue.rating,
            reviewCount: 0,
            operatingHours: venue.operatingHours,
            peakPricing: venue.peakPricing || null,
            timeSlots: venue.timeSlots || [],
            timeSlotCount: venue._count?.timeSlots ?? venue.timeSlots?.length ?? 0,
            policies: {
                cancellationPolicy: '',
                advanceBookingDays: 30,
                minimumBookingHours: 1,
            },
            isActive: venue.isActive,
            createdAt: venue.createdAt?.toISOString?.() ?? venue.createdAt,
            updatedAt: venue.updatedAt?.toISOString?.() ?? venue.updatedAt,
        };
    }
    static async createVenue(data, partnerId) {
        const venue = await index_1.prisma.$transaction(async (tx) => {
            const created = await tx.venue.create({
                data: {
                    name: data.name,
                    description: data.description,
                    city: data.address.city,
                    state: data.address.state,
                    pincode: data.address.pincode,
                    contactInfo: data.contactInfo,
                    operatingHours: data.operatingHours,
                    peakPricing: data.peakPricing || undefined,
                    sports: data.sports,
                    amenities: data.amenities,
                    partner: { connect: { id: partnerId } },
                    address: {
                        create: {
                            street: data.address.street,
                            lat: data.address.coordinates?.latitude,
                            lng: data.address.coordinates?.longitude,
                        },
                    },
                    images: {
                        create: (data.images || []).map((url) => ({ url })),
                    },
                },
                include: { address: true, images: true },
            });
            const basePrice = data.timeSlots?.[0]?.price || 1000;
            await (0, slotGenerator_1.generateSlotsForRange)(tx, {
                venueId: created.id,
                sports: data.sports,
                operatingHours: data.operatingHours,
                basePrice,
                daysCount: slotGenerator_1.ROLLING_WINDOW_DAYS,
                peakPricing: data.peakPricing || null,
            });
            return created;
        });
        return this.mapVenueForClient(venue);
    }
    static async getVenuesByPartner(partnerId) {
        const venues = await index_1.prisma.venue.findMany({
            where: { partnerId },
            include: { address: true, images: true, _count: { select: { timeSlots: true } } },
            orderBy: { createdAt: 'desc' },
        });
        return venues.map((venue) => this.mapVenueForClient(venue));
    }
    static async getVenueById(venueId, partnerId) {
        const venue = await index_1.prisma.venue.findFirst({
            where: { id: venueId, partnerId },
            include: { address: true, images: true, timeSlots: true },
        });
        return venue ? this.mapVenueForClient(venue) : null;
    }
    static async updateVenue(venueId, partnerId, data) {
        const existingVenue = await index_1.prisma.venue.findFirst({ where: { id: venueId, partnerId } });
        if (!existingVenue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const venue = await index_1.prisma.venue.update({
            where: { id: venueId },
            data: {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                city: data.address?.city,
                state: data.address?.state,
                pincode: data.address?.pincode,
                contactInfo: data.contactInfo,
                operatingHours: data.operatingHours,
                peakPricing: data.peakPricing,
                sports: data.sports,
                amenities: data.amenities,
                ...(data.address
                    ? {
                        address: {
                            upsert: {
                                create: {
                                    street: data.address.street || '',
                                    lat: data.address.coordinates?.latitude,
                                    lng: data.address.coordinates?.longitude,
                                },
                                update: {
                                    ...(data.address.street !== undefined ? { street: data.address.street } : {}),
                                    ...(data.address.coordinates?.latitude !== undefined
                                        ? { lat: data.address.coordinates.latitude }
                                        : {}),
                                    ...(data.address.coordinates?.longitude !== undefined
                                        ? { lng: data.address.coordinates.longitude }
                                        : {}),
                                },
                            },
                        },
                    }
                    : {}),
            },
            include: { address: true, images: true },
        });
        return this.mapVenueForClient(venue);
    }
    static async deleteVenue(venueId, partnerId) {
        const existingVenue = await index_1.prisma.venue.findFirst({ where: { id: venueId, partnerId } });
        if (!existingVenue) {
            throw new Error('Venue not found or not owned by partner');
        }
        await index_1.prisma.venue.delete({ where: { id: venueId } });
    }
}
exports.VenueService = VenueService;
//# sourceMappingURL=venue.js.map