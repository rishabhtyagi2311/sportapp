export declare function timeToMins(t: string): number;
export declare function minsToTime(m: number): string;
/** Days of slots that should always exist ahead of today, topped up by the daily rolling job. */
export declare const ROLLING_WINDOW_DAYS = 3;
export interface PeakPricingRule {
    enabled: boolean;
    startTime: string;
    endTime: string;
    price: number;
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
export declare function buildCandidateSlots(params: {
    venueId: string;
    sports: any[];
    operatingHours: any;
    basePrice: number;
    daysCount: number;
    startDate: Date;
    peakPricing?: PeakPricingRule | null;
}): any[];
/**
 * Generates and persists slots for a venue, deduping against slots that
 * already exist for the same variety/date/start/end. Returns the count of
 * newly-created slots. Pass a transaction client (`tx`) when called as part
 * of venue creation so it participates in the same transaction.
 */
export declare function generateSlotsForRange(client: any, params: {
    venueId: string;
    sports: any[];
    operatingHours: any;
    basePrice: number;
    daysCount?: number;
    startDate?: Date;
    peakPricing?: PeakPricingRule | null;
}): Promise<number>;
//# sourceMappingURL=slotGenerator.d.ts.map