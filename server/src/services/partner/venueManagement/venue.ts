import { prisma as globalClient } from "../../../index";
import { generateSlotsForRange, repriceAvailableSlots, ROLLING_WINDOW_DAYS } from "./slotGenerator";

/**
 * Professional Venue Service
 * Handles Venue lifecycle and automated TimeSlot generation
 */
export class VenueService {

  /**
   * Reshapes the flat Prisma Venue row (+ address/images/_count relations)
   * into the nested shape the frontend `Venue` type expects. The DB keeps
   * city/state/pincode on the venue row and street/lat/lng on a separate
   * Address row; the client always wants one nested `address` object.
   */
  static mapVenueForClient(venue: any) {
    const images = (venue.images || []).map((img: any) => img.url);
    // Partner-selected cover wins; if unset (or it no longer points at an
    // existing photo — e.g. that image was since removed) fall back to
    // whichever photo happens to be first, rather than showing blank.
    const coverImage = venue.coverImageUrl && images.includes(venue.coverImageUrl)
      ? venue.coverImageUrl
      : images[0] || null;

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
      images,
      coverImage,
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

  static async createVenue(data: any, partnerId: string) {
    // Only honor a client-supplied cover if it's actually among the photos
    // being uploaded — otherwise mapVenueForClient's fallback (first image)
    // takes over.
    const coverImageUrl = data.coverImageUrl && (data.images || []).includes(data.coverImageUrl)
      ? data.coverImageUrl
      : undefined;

    const venue = await globalClient.$transaction(async (tx) => {
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
          coverImageUrl,
          partner: { connect: { id: partnerId } },
          address: {
            create: {
              street: data.address.street,
              lat: data.address.coordinates?.latitude,
              lng: data.address.coordinates?.longitude,
            },
          },
          images: {
            create: (data.images || []).map((url: string) => ({ url })),
          },
        },
        include: { address: true, images: true },
      });

      const basePrice = data.timeSlots?.[0]?.price || 1000;

      await generateSlotsForRange(tx, {
        venueId: created.id,
        sports: data.sports,
        operatingHours: data.operatingHours,
        basePrice,
        daysCount: ROLLING_WINDOW_DAYS,
        peakPricing: data.peakPricing || null,
      });

      return created;
    });

    return this.mapVenueForClient(venue);
  }

  static async getVenuesByPartner(partnerId: string) {
    const venues = await globalClient.venue.findMany({
      where: { partnerId },
      include: { address: true, images: true, _count: { select: { timeSlots: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return venues.map((venue) => this.mapVenueForClient(venue));
  }

  static async getVenueById(venueId: string, partnerId: string) {
    const venue = await globalClient.venue.findFirst({
      where: { id: venueId, partnerId },
      include: { address: true, images: true, timeSlots: true },
    });

    return venue ? this.mapVenueForClient(venue) : null;
  }

  static async updateVenue(venueId: string, partnerId: string, data: any) {
    const existingVenue = await globalClient.venue.findFirst({
      where: { id: venueId, partnerId },
      include: { images: true },
    });

    if (!existingVenue) {
      throw new Error('Venue not found or not owned by partner');
    }

    if (data.coverImageUrl !== undefined) {
      const candidateImages = data.images ?? existingVenue.images.map((img) => img.url);
      if (data.coverImageUrl !== null && !candidateImages.includes(data.coverImageUrl)) {
        throw new Error("Selected cover photo is not one of this venue's photos");
      }
    }

    const venue = await globalClient.venue.update({
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
        coverImageUrl: data.coverImageUrl,
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
        // Full-array replace, matching how `sports`/`amenities` already work —
        // the client always sends the complete desired image list.
        ...(data.images
          ? { images: { deleteMany: {}, create: data.images.map((url: string) => ({ url })) } }
          : {}),
      },
      include: { address: true, images: true },
    });

    // Sports/pricing changed — reprice existing available slots to match
    // (peak pricing composes correctly per-slot) and backfill any newly
    // added varieties or rolling-window days.
    if (data.sports) {
      const lastSlot = await globalClient.timeSlot.findFirst({
        where: { venueId },
        orderBy: { price: "desc" },
        select: { price: true },
      });
      const fallbackBasePrice = lastSlot?.price || 1000;
      const effectivePeakPricing = (data.peakPricing ?? venue.peakPricing) as any;

      await repriceAvailableSlots(globalClient, {
        venueId,
        sports: data.sports,
        peakPricing: effectivePeakPricing,
        fallbackBasePrice,
      });

      await generateSlotsForRange(globalClient, {
        venueId,
        sports: data.sports,
        operatingHours: (data.operatingHours ?? venue.operatingHours) as any,
        basePrice: fallbackBasePrice,
        daysCount: ROLLING_WINDOW_DAYS,
        peakPricing: effectivePeakPricing,
      });
    }

    return this.mapVenueForClient(venue);
  }

  static async deleteVenue(venueId: string, partnerId: string) {
    const existingVenue = await globalClient.venue.findFirst({ where: { id: venueId, partnerId } });

    if (!existingVenue) {
      throw new Error('Venue not found or not owned by partner');
    }

    await globalClient.venue.delete({ where: { id: venueId } });
  }

  /** Public, unauthenticated browse — no partnerId scoping, active venues only. */
  static async getPublicVenues(filters: { city?: string } = {}) {
    const venues = await globalClient.venue.findMany({
      where: {
        isActive: true,
        ...(filters.city ? { city: { equals: filters.city, mode: 'insensitive' } } : {}),
      },
      include: { address: true, images: true, _count: { select: { timeSlots: true } } },
      orderBy: { createdAt: 'desc' },
    });

    return venues.map((venue) => this.mapVenueForClient(venue));
  }

  static async getPublicVenueById(venueId: string) {
    const venue = await globalClient.venue.findFirst({
      where: { id: venueId, isActive: true },
      include: { address: true, images: true, timeSlots: true },
    });

    return venue ? this.mapVenueForClient(venue) : null;
  }
}
