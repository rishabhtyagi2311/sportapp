import { PrismaClient } from '@prisma/client';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Removes past-dated slots that were never booked/blocked/used for a match
 * session. Only 'available' slots are deleted — booked/blocked/match_session
 * slots are left untouched so booking/session history is preserved.
 */
export async function cleanupExpiredSlots(prisma: PrismaClient): Promise<number> {
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

/**
 * Runs the cleanup every 24 hours. Does not run immediately — the initial
 * run is sequenced explicitly in index.ts (before slot generation, so the
 * two jobs never race against each other over the same day's rows).
 */
export function scheduleSlotCleanup(prisma: PrismaClient): void {
  setInterval(() => {
    cleanupExpiredSlots(prisma).catch((err) => console.error('[slotCleanup] run failed:', err));
  }, DAY_MS);
}
