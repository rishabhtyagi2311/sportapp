import { PrismaClient } from '@prisma/client';
/**
 * Removes past-dated slots that were never booked/blocked/used for a match
 * session. Only 'available' slots are deleted — booked/blocked/match_session
 * slots are left untouched so booking/session history is preserved.
 */
export declare function cleanupExpiredSlots(prisma: PrismaClient): Promise<number>;
/** Runs the cleanup once at startup, then every 24 hours. */
export declare function scheduleSlotCleanup(prisma: PrismaClient): void;
//# sourceMappingURL=slotCleanup.d.ts.map