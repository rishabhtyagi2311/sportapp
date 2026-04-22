// import {prisma as client} from "../../../index"

// export class VenueService {
//   /**
//    * REUSABLE: Generates slots for a specific date range and specific Resource (Variety)
//    * This can be called by Venue Creation OR a Cron Job
//    */
//   static async generateSlotsForRange(
//     venueId: string,
//     sports: any[],
//     operatingHours: any,
//     basePrice: number,
//     daysCount: number = 30,
//     startDate: Date = new Date()
//   ) {
//     const slots: any[] = [];

//     sports.forEach((sport: any) => {
//       sport.varieties.forEach((variety: any) => {
//         for (let i = 0; i < daysCount; i++) {
//           const targetDate = new Date(startDate);
//           targetDate.setDate(startDate.getDate() + i);
//           targetDate.setHours(0, 0, 0, 0);

//           const dayName = targetDate
//             .toLocaleDateString('en-US', { weekday: 'long' })
//             .toLowerCase();

//           const dayConfig = operatingHours[dayName];

//           // Only generate if the venue is open on this day
//           if (dayConfig && dayConfig.isOpen) {
//             let currentMins = this.timeToMins(dayConfig.open);
//             const endMins = this.timeToMins(dayConfig.close);

//             while (currentMins + 30 <= endMins) {
//               slots.push({
//                 venueId,
//                 varietyId: variety.id,
//                 varietyName: variety.name,
//                 date: targetDate,
//                 startTime: this.minsToTime(currentMins),
//                 endTime: this.minsToTime(currentMins + 30),
//                 price: basePrice,
//                 status: 'available',
//               });
//               currentMins += 30;
//             }
//           }
//         }
//       });
//     });

//     // We use createMany for high-performance bulk insertion
//     if (slots.length > 0) {
//       return await client.timeSlot.createMany({
//         data: slots,
//         skipDuplicates: true, // Prevents crashing if slots already exist for that day
//       });
//     }
//   }

//   /**
//    * VENUE CREATION: Calls the slot generator internally
//    */
//   static async createVenue(data: any) {
//     return await client.$transaction(async (tx) => {
//       // 1. Create Venue Identity
//       const venue = await tx.venue.create({
//         data: {
//           name: data.name,
//           description: data.description,
//           city: data.address.city,
//           state: data.address.state,
//           pincode: data.address.pincode,
//           contactInfo: data.contactInfo,
//           operatingHours: data.operatingHours,
//           sports: data.sports,
//           amenities: data.amenities,
//           address: {
//             create: {
//               street: data.address.street,
//               lat: data.address.coordinates?.latitude,
//               lng: data.address.coordinates?.longitude,
//             },
//           },
//           images: {
//             create: data.images.map((url: string) => ({ url })),
//           },
//         },
//       });

//       // 2. Separate Call: Generate the first 30 days of slots
//       const basePrice = data.timeSlots[0]?.price || 1000;
//       await this.generateSlotsForRange(
//         venue.id,
//         data.sports,
//         data.operatingHours,
//         basePrice,
//         30 // Initial 30 days
//       );

//       return venue;
//     });
//   }

//   // Helpers
//   private static timeToMins(t: string) {
//     const [h, m] = t.split(':').map(Number);
//     return h * 60 + m;
//   }

//   private static minsToTime(m: number) {
//     return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
//   }
// }