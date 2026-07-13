import { PrismaClient } from '@prisma/client';
/**
 * Tops up every venue's slots so a rolling ROLLING_WINDOW_DAYS-day window
 * ahead of today always exists. Generation is dedup-safe (see
 * generateSlotsForRange), so re-running this over already-covered days is a
 * cheap no-op — only the day newly entering the window each day actually
 * inserts rows.
 */
export declare function generateRollingSlots(prisma: PrismaClient): Promise<number>;
/** Runs the rolling top-up once at startup, then every 24 hours. */
export declare function scheduleSlotGeneration(prisma: PrismaClient): void;
//# sourceMappingURL=slotGeneration.d.ts.map