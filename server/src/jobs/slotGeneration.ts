import { PrismaClient } from '@prisma/client';
import { generateSlotsForRange, ROLLING_WINDOW_DAYS } from '../services/partner/venueManagement/slotGenerator';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Tops up every venue's slots so a rolling ROLLING_WINDOW_DAYS-day window
 * ahead of today always exists. Generation is dedup-safe (see
 * generateSlotsForRange), so re-running this over already-covered days is a
 * cheap no-op — only the day newly entering the window each day actually
 * inserts rows.
 */
export async function generateRollingSlots(prisma: PrismaClient): Promise<number> {
  const venues = await prisma.venue.findMany({
    select: { id: true, sports: true, operatingHours: true, peakPricing: true, timeSlots: { take: 1, orderBy: { price: 'desc' }, select: { price: true } } },
  });

  let totalGenerated = 0;

  for (const venue of venues) {
    try {
      const generated = await generateSlotsForRange(prisma, {
        venueId: venue.id,
        sports: venue.sports as any[],
        operatingHours: venue.operatingHours as any,
        basePrice: venue.timeSlots[0]?.price || 1000,
        daysCount: ROLLING_WINDOW_DAYS,
        peakPricing: venue.peakPricing as any,
      });
      totalGenerated += generated;
    } catch (err) {
      console.error(`[slotGeneration] failed for venue ${venue.id}:`, err);
    }
  }

  if (totalGenerated > 0) {
    console.log(`[slotGeneration] Topped up ${totalGenerated} new slot(s) across ${venues.length} venue(s)`);
  }

  return totalGenerated;
}

/**
 * Runs the rolling top-up every 24 hours. Does not run immediately — the
 * initial run is sequenced explicitly in index.ts (after slot cleanup, so
 * the two jobs never race against each other over the same day's rows).
 */
export function scheduleSlotGeneration(prisma: PrismaClient): void {
  setInterval(() => {
    generateRollingSlots(prisma).catch((err) => console.error('[slotGeneration] run failed:', err));
  }, DAY_MS);
}
