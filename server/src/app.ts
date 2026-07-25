import express from 'express';
import cors from 'cors';
import partnerVenueRouter from './routers/partner/venueManagement/venue.route';
import partnerSlotRouter from './routers/partner/venueManagement/slot.route';
import partnerAuthRouter from './routers/partner/auth/auth.route';
import partnerStorageRouter from './routers/partner/storage/storage.route';
import partnerAcademyRouter from './routers/partner/academyManagement/academy.route';
import userAuthRouter from './routers/user/auth/auth.route';
import userVenueRouter from './routers/user/venue/venue.route';
import userBookingRouter from './routers/user/booking/booking.route';
import userMatchSessionRouter from './routers/user/matchSession/matchSession.route';
import userAcademyRouter from './routers/user/academyManagement/academy.route';
import userEventRouter from './routers/user/eventManagement/event.route';
import userFootballRouter from './routers/user/footballManagement/football.route';

// Express app definition, kept separate from process startup (listen +
// cron scheduling in index.ts) so it can be imported by tests via
// supertest without binding a port or starting background jobs.
const app = express();

app.use(cors());
app.use(express.json());

app.use((req, _res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} from ${req.ip}`);
  next();
});

app.use('/api/v1/partner', partnerAuthRouter);
app.use('/api/v1/partner', partnerStorageRouter);
app.use('/api/v1/partner', partnerVenueRouter);
app.use('/api/v1/partner', partnerSlotRouter);
app.use('/api/v1/partner', partnerAcademyRouter);
app.use('/api/v1/user', userAuthRouter);
app.use('/api/v1/user', userVenueRouter);
app.use('/api/v1/user', userBookingRouter);
app.use('/api/v1/user', userMatchSessionRouter);
app.use('/api/v1/user', userAcademyRouter);
app.use('/api/v1/user', userEventRouter);
app.use('/api/v1/user', userFootballRouter);

export default app;
