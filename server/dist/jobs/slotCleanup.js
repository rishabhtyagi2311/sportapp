"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanupExpiredSlots = cleanupExpiredSlots;
exports.scheduleSlotCleanup = scheduleSlotCleanup;
const DAY_MS = 24 * 60 * 60 * 1000;
/**
 * Removes past-dated slots that were never booked/blocked/used for a match
 * session. Only 'available' slots are deleted — booked/blocked/match_session
 * slots are left untouched so booking/session history is preserved.
 */
async function cleanupExpiredSlots(prisma) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const result = await prisma.timeSlot.deleteMany({
        where: {
            date: { lt: today },
            status: 'available',
        },
    });
    if (result.count > 0) {
        console.log(`[slotCleanup] Removed ${result.count} expired available slot(s)`);
    }
    return result.count;
}
/** Runs the cleanup once at startup, then every 24 hours. */
function scheduleSlotCleanup(prisma) {
    cleanupExpiredSlots(prisma).catch((err) => console.error('[slotCleanup] initial run failed:', err));
    setInterval(() => {
        cleanupExpiredSlots(prisma).catch((err) => console.error('[slotCleanup] run failed:', err));
    }, DAY_MS);
}
//# sourceMappingURL=slotCleanup.js.map