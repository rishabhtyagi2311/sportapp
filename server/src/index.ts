import { PrismaClient } from '@prisma/client';
import app from './app';
import { scheduleSlotCleanup, cleanupExpiredSlots } from './jobs/slotCleanup';
import { scheduleSlotGeneration, generateRollingSlots } from './jobs/slotGeneration';

export const prisma = new PrismaClient();

// Only bind the port / start background jobs when this file is the actual
// process entry point — not when it's required indirectly (e.g. by tests
// importing the app, or by any other module reaching for `prisma`).
if (require.main === module) {
  // Sequenced (not fire-and-forget in parallel): cleanup must fully finish
  // before generation runs, otherwise a delete-in-progress for "past" rows
  // can race a concurrent insert for "today" rows and the two jobs can
  // clobber each other's view of what "today" currently is.
  (async () => {
    await cleanupExpiredSlots(prisma).catch((err) => console.error('[slotCleanup] initial run failed:', err));
    await generateRollingSlots(prisma).catch((err) => console.error('[slotGeneration] initial run failed:', err));
  })();

  scheduleSlotCleanup(prisma);
  scheduleSlotGeneration(prisma);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`server is up at port ${PORT}`);
  });
}
