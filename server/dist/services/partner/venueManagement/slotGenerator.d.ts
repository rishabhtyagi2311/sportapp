export declare function timeToMins(t: string): number;
export declare function minsToTime(m: number): string;
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
 * Day-of-week is derived from the server's local calendar day (`getDay()`),
 * not from locale-formatted strings, so this has no dependency on Node's
 * ICU/locale data. This still assumes the server and the venues it serves
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