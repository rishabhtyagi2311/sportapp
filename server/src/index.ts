import express from 'express';
import cors from 'cors';
import { router as onboardingRouter } from './routerUser/onboardingRouter';
import { router as footballRouter } from './routerUser/footballRouter';
import { PrismaClient } from '@prisma/client';
import partnerVenueRouter from './routers/partner/venueManagement/venue.route';
import partnerSlotRouter from './routers/partner/venueManagement/slot.route';
import partnerAuthRouter from './routers/partner/auth/auth.route';
import partnerStorageRouter from './routers/partner/storage/storage.route';
import partnerAcademyRouter from './routers/partner/academyManagement/academy.route';
import { scheduleSlotCleanup } from './jobs/slotCleanup';

const app = express();
export const prisma = new PrismaClient();

scheduleSlotCleanup(prisma);

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use('/api/v1/onboarding', onboardingRouter);
app.use('/api/v1/football', footballRouter);
app.use('/api/v1/partner', partnerAuthRouter);
app.use('/api/v1/partner', partnerStorageRouter);
app.use('/api/v1/partner', partnerVenueRouter);
app.use('/api/v1/partner', partnerSlotRouter);
app.use('/api/v1/partner', partnerAcademyRouter);

app.listen(3000, () => {
  console.log('server is up at port 3000');
});


