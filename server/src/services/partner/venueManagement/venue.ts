import { prisma as globalClient } from "../../../index";

/**
 * Professional Venue Service
 * Handles Venue lifecycle and automated TimeSlot generation
 */
export class VenueService {
  
  /**
   * REUSABLE SLOT GENERATOR
   * Can be called during Venue creation or by a nightly Cron Job.
   * @param txClient - Uses the transaction client if provided, otherwise the global client.
   */
  static async generateSlotsForRange(
    venueId: string,
    sports: any[],
    operatingHours: any,
    basePrice: number,
    daysCount: number = 30,
    txClient?: any 
  ) {
    const client = txClient || globalClient;
    const slots: any[] = [];
    const today = new Date();

    for (const sport of sports) {
      for (const variety of sport.varieties) {
        for (let i = 0; i < daysCount; i++) {
          const targetDate = new Date(today);
          targetDate.setDate(today.getDate() + i);
          targetDate.setHours(0, 0, 0, 0); // Normalize to midnight for consistent querying

          const dayName = targetDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
          const dayConfig = operatingHours[dayName];

          // Business Rule: Only generate slots if the venue is marked as Open (Working Day)
          if (dayConfig && dayConfig.isOpen) {
            let currentMins = this.timeToMins(dayConfig.open);
            const endMins = this.timeToMins(dayConfig.close);

            while (currentMins + 30 <= endMins) {
              slots.push({
                venueId,
                varietyId: variety.id,
                varietyName: variety.name,
                date: targetDate,
                startTime: this.minsToTime(currentMins),
                endTime: this.minsToTime(currentMins + 30),
                price: basePrice,
                status: 'available',
              });
              currentMins += 30;
            }
          }
        }
      }
    }

    if (slots.length > 0) {
      // Create many is used for high-performance bulk insertion
      await client.timeSlot.createMany({ 
        data: slots,
        skipDuplicates: true 
      });
    }
  }

  /**
   * CREATE VENUE (Atomic Transaction)
   * Ensures Venue, Address, Images, and initial Slots are created together.
   */
  static async createVenue(data: any, partnerId: string) {
    return await globalClient.$transaction(async (tx) => {
      // 1. Create the Venue record linked to the Partner
      const venue = await tx.venue.create({
        data: {
          name: data.name,
          description: data.description,
          city: data.address.city,
          state: data.address.state,
          pincode: data.address.pincode,
          contactInfo: data.contactInfo,
          operatingHours: data.operatingHours,
          sports: data.sports,
          amenities: data.amenities,
          
          // Connect to the authenticated PartnerIdentity
          partner: {
            connect: { id: partnerId }
          },

          // Create Address (1:1 Relation)
          address: {
            create: {
              street: data.address.street,
              lat: data.address.coordinates?.latitude,
              lng: data.address.coordinates?.longitude,
            },
          },

          // Create Images (1:N Relation)
          images: {
            create: data.images.map((url: string) => ({ url })),
          },
        },
      });

      // 2. Extract base price from the template slot provided by frontend
      const basePrice = data.timeSlots[0]?.price || 1000;
      
      // 3. Kick off initial slot generation within the SAME transaction
      await this.generateSlotsForRange(
        venue.id,
        data.sports,
        data.operatingHours,
        basePrice,
        30,
        tx 
      );

      return venue;
    });
  }

  /**
   * FETCH VENUES BY PARTNER
   */
  static async getVenuesByPartner(partnerId: string) {
    return await globalClient.venue.findMany({
      where: { partnerId },
      include: { 
        address: true, 
        images: true 
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  /* --- PRIVATE HELPERS --- */

  private static timeToMins(t: string): number {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  }

  private static minsToTime(m: number): string {
    return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
  }
}