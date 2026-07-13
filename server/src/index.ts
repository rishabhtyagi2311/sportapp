import { PrismaClient } from '@prisma/client';
import app from './app';
import { scheduleSlotCleanup } from './jobs/slotCleanup';
import { scheduleSlotGeneration } from './jobs/slotGeneration';

export const prisma = new PrismaClient();

// Only bind the port / start background jobs when this file is the actual
// process entry point — not when it's required indirectly (e.g. by tests
// importing the app, or by any other module reaching for `prisma`).
if (require.main === module) {
  scheduleSlotCleanup(prisma);
  scheduleSlotGeneration(prisma);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`server is up at port ${PORT}`);
  });
}
