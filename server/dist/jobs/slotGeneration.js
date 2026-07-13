"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRollingSlots = generateRollingSlots;
exports.scheduleSlotGeneration = scheduleSlotGeneration;
const slotGenerator_1 = require("../services/partner/venueManagement/slotGenerator");
const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Tops up every venue's slots so a rolling ROLLING_WINDOW_DAYS-day window
 * ahead of today always exists. Generation is dedup-safe (see
 * generateSlotsForRange), so re-running this over already-covered days is a
 * cheap no-op — only the day newly entering the window each day actually
 * inserts rows.
 */
async function generateRollingSlots(prisma) {
    const venues = await prisma.venue.findMany({
        select: { id: true, sports: true, operatingHours: true, peakPricing: true, timeSlots: { take: 1, orderBy: { price: 'desc' }, select: { price: true } } },
    });
    let totalGenerated = 0;
    for (const venue of venues) {
        try {
            const generated = await (0, slotGenerator_1.generateSlotsForRange)(prisma, {
                venueId: venue.id,
                sports: venue.sports,
                operatingHours: venue.operatingHours,
                basePrice: venue.timeSlots[0]?.price || 1000,
                daysCount: slotGenerator_1.ROLLING_WINDOW_DAYS,
                peakPricing: venue.peakPricing,
            });
            totalGenerated += generated;
        }
        catch (err) {
            console.error(`[slotGeneration] failed for venue ${venue.id}:`, err);
        }
    }
    if (totalGenerated > 0) {
        console.log(`[slotGeneration] Topped up ${totalGenerated} new slot(s) across ${venues.length} venue(s)`);
    }
    return totalGenerated;
}
/** Runs the rolling top-up once at startup, then every 24 hours. */
function scheduleSlotGeneration(prisma) {
    generateRollingSlots(prisma).catch((err) => console.error('[slotGeneration] initial run failed:', err));
    setInterval(() => {
        generateRollingSlots(prisma).catch((err) => console.error('[slotGeneration] run failed:', err));
    }, DAY_MS);
}
//# sourceMappingURL=slotGeneration.js.map