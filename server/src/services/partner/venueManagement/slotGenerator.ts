export function timeToMins(t: string): number {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

export function minsToTime(m: number): string {
  return `${Math.floor(m / 60).toString().padStart(2, '0')}:${(m % 60).toString().padStart(2, '0')}`;
}

const WEEKDAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/** Days of slots that should always exist ahead of today, topped up by the daily rolling job. */
export const ROLLING_WINDOW_DAYS = 3;

export interface PeakPricingRule {
  enabled: boolean;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  price: number;
}

export function priceForSlot(startMins: number, basePrice: number, peakPricing?: PeakPricingRule | null): number {
  if (!peakPricing?.enabled) return basePrice;

  const peakStart = timeToMins(peakPricing.startTime);
  const peakEnd = timeToMins(peakPricing.endTime);

  return startMins >= peakStart && startMins < peakEnd ? peakPricing.price : basePrice;
}

/**
 * Re-prices every still-'available' (unbooked) current/future slot to match
 * the venue's current per-variety base price + peak-pricing rule. Needed
 * because editing a venue only ever touches its `sports`/`peakPricing` JSON —
 * without this, a partner changing a variety's price would never see it
 * reflected on slots generated before the edit (they'd keep whatever price
 * was baked in at generation time, forever). Booked/blocked slots are left
 * untouched so past pricing on an existing booking is never rewritten.
 */
export async function repriceAvailableSlots(
  client: any,
  params: {
    venueId: string;
    sports: any[];
    peakPricing?: PeakPricingRule | null;
    fallbackBasePrice: number;
  }
): Promise<number> {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const varietyBasePriceById = new Map<string, number>();
  for (const sport of params.sports || []) {
    for (const variety of sport.varieties || []) {
      varietyBasePriceById.set(variety.id, variety.basePrice ?? params.fallbackBasePrice);
    }
  }

  const slots = await client.timeSlot.findMany({
    where: { venueId: params.venueId, status: "available", date: { gte: today } },
    select: { id: true, varietyId: true, startTime: true, price: true },
  });

  let updatedCount = 0;
  for (const slot of slots) {
    const basePrice = varietyBasePriceById.get(slot.varietyId);
    if (basePrice === undefined) continue; // variety no longer exists on the venue — leave its old slots alone

    const newPrice = priceForSlot(timeToMins(slot.startTime), basePrice, params.peakPricing);
    if (newPrice !== slot.price) {
      await client.timeSlot.update({ where: { id: slot.id }, data: { price: newPrice } });
      updatedCount += 1;
    }
  }

  return updatedCount;
}

/**
 * Builds the list of candidate slots for a venue over a date range based on
 * its sports/varieties and weekly operating hours. Does not touch the DB.
 *
 * Dates are anchored as UTC midnight for the server's local calendar day
 * (via `Date.UTC`), matching how date-only strings like "2026-07-13" from
 * the client are parsed (`new Date("2026-07-13")` is UTC midnight per the
 * ES spec). Using local-midnight `Date` objects here instead would silently
 * desync from every exact-date lookup whenever the server's UTC offset is
 * non-zero (e.g. IST) — the slot would exist but no query for "today" would
 * ever find it. This still assumes the server and the venues it serves
 * share a timezone (true for this single-region deployment) — full
 * correctness for multi-timezone venues would require storing a per-venue
 * IANA timezone, which the schema does not have.
 */
export function buildCandidateSlots(params: {
  venueId: string;
  sports: any[];
  operatingHours: any;
  basePrice: number;
  daysCount: number;
  startDate: Date;
  peakPricing?: PeakPricingRule | null;
}): any[] {
  const { venueId, sports, operatingHours, basePrice, daysCount, startDate, peakPricing } = params;
  const slots: any[] = [];

  for (const sport of sports || []) {
    for (const variety of sport.varieties || []) {
      // A variety with its own base price is priced independently (e.g. a
      // badminton court vs. a cricket box at the same venue); varieties left
      // unpriced fall back to the venue's single default rate.
      const varietyBasePrice = variety.basePrice ?? basePrice;

      for (let i = 0; i < daysCount; i++) {
        const targetDate = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + i));

        const dayName = WEEKDAYS[targetDate.getUTCDay()];
        const dayConfig = operatingHours?.[dayName];

        if (dayConfig && dayConfig.isOpen) {
          let currentMins = timeToMins(dayConfig.open);
          const endMins = timeToMins(dayConfig.close);

          while (currentMins + 30 <= endMins) {
            slots.push({
              venueId,
              varietyId: variety.id,
              varietyName: variety.name,
              date: targetDate,
              startTime: minsToTime(currentMins),
              endTime: minsToTime(currentMins + 30),
              price: priceForSlot(currentMins, varietyBasePrice, peakPricing),
              status: 'available',
            });
            currentMins += 30;
          }
        }
      }
    }
  }

  return slots;
}

/**
 * Generates and persists slots for a venue, deduping against slots that
 * already exist for the same variety/date/start/end. Returns the count of
 * newly-created slots. Pass a transaction client (`tx`) when called as part
 * of venue creation so it participates in the same transaction.
 */
export async function generateSlotsForRange(
  client: any,
  params: {
    venueId: string;
    sports: any[];
    operatingHours: any;
    basePrice: number;
    daysCount?: number;
    startDate?: Date;
    peakPricing?: PeakPricingRule | null;
  }
): Promise<number> {
  const daysCount = params.daysCount ?? ROLLING_WINDOW_DAYS;
  const startDate = params.startDate ?? new Date();

  const slots = buildCandidateSlots({
    venueId: params.venueId,
    sports: params.sports,
    operatingHours: params.operatingHours,
    basePrice: params.basePrice,
    daysCount,
    startDate,
    peakPricing: params.peakPricing,
  });

  if (slots.length === 0) {
    return 0;
  }

  const rangeEnd = new Date(Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + daysCount));

  const existingSlots = await client.timeSlot.findMany({
    where: {
      venueId: params.venueId,
      date: { gte: startDate, lte: rangeEnd },
    },
    select: { varietyId: true, date: true, startTime: true, endTime: true },
  });

  const existingKeySet = new Set(
    existingSlots.map(
      (slot: any) => `${slot.varietyId}:${slot.date.toISOString().slice(0, 10)}:${slot.startTime}:${slot.endTime}`
    )
  );

  const dedupedSlots = slots.filter((slot) => {
    const key = `${slot.varietyId}:${slot.date.toISOString().slice(0, 10)}:${slot.startTime}:${slot.endTime}`;
    return !existingKeySet.has(key);
  });

  if (dedupedSlots.length > 0) {
    await client.timeSlot.createMany({ data: dedupedSlots, skipDuplicates: true });
  }

  return dedupedSlots.length;
}
