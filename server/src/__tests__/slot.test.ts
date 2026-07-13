import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { authHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

const PARTNER_ID = 'partner-1';
const VENUE_ID = 'venue-1';

function fakeVenue(overrides: Partial<any> = {}) {
  return {
    id: VENUE_ID,
    partnerId: PARTNER_ID,
    sports: [],
    operatingHours: {},
    peakPricing: null,
    ...overrides,
  };
}

function fakeSlot(overrides: Partial<any> = {}) {
  return {
    id: 'slot-1',
    venueId: VENUE_ID,
    varietyId: 'variety-1',
    varietyName: '5-a-side',
    date: new Date('2026-07-14T00:00:00.000Z'),
    startTime: '09:00',
    endTime: '09:30',
    price: 1000,
    status: 'available',
    ...overrides,
  };
}

describe('GET /api/v1/partner/venues/:venueId/slots', () => {
  it('returns slots for an owned venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findMany.mockResolvedValue([fakeSlot()] as any);

    const res = await request(app)
      .get(`/api/v1/partner/venues/${VENUE_ID}/slots`)
      .query({ date: '2026-07-14' })
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/v1/partner/venues/:venueId/slots/generate', () => {
  it('defaults to the rolling window size when no daysCount is given', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findMany.mockResolvedValue([]);
    prismaMock.timeSlot.createMany.mockResolvedValue({ count: 0 } as any);

    const res = await request(app)
      .post(`/api/v1/partner/venues/${VENUE_ID}/slots/generate`)
      .set(authHeader(PARTNER_ID))
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.generatedCount).toBe(0);
  });

  it('reports newly created slots when the venue has open sports/varieties', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(
      fakeVenue({
        sports: [{ id: 's1', name: 'Football', varieties: [{ id: 'variety-1', name: '5-a-side' }] }],
        operatingHours: {
          monday: { open: '06:00', close: '22:00', isOpen: true },
          tuesday: { open: '06:00', close: '22:00', isOpen: true },
          wednesday: { open: '06:00', close: '22:00', isOpen: true },
          thursday: { open: '06:00', close: '22:00', isOpen: true },
          friday: { open: '06:00', close: '22:00', isOpen: true },
          saturday: { open: '06:00', close: '22:00', isOpen: true },
          sunday: { open: '06:00', close: '22:00', isOpen: true },
        },
      }) as any
    );
    prismaMock.timeSlot.findMany.mockResolvedValue([]);
    prismaMock.timeSlot.createMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .post(`/api/v1/partner/venues/${VENUE_ID}/slots/generate`)
      .set(authHeader(PARTNER_ID))
      .send({});

    expect(res.status).toBe(200);
    expect(res.body.data.generatedCount).toBeGreaterThan(0);
    expect(prismaMock.timeSlot.createMany).toHaveBeenCalledTimes(1);
  });
});

describe('PATCH /api/v1/partner/slots/:slotId', () => {
  it('updates the price of an available slot', async () => {
    prismaMock.timeSlot.findFirst.mockResolvedValue({ ...fakeSlot(), venue: fakeVenue() } as any);
    prismaMock.timeSlot.update.mockResolvedValue(fakeSlot({ price: 1500 }) as any);

    const res = await request(app)
      .patch('/api/v1/partner/slots/slot-1')
      .set(authHeader(PARTNER_ID))
      .send({ price: 1500 });

    expect(res.status).toBe(200);
    expect(res.body.data.price).toBe(1500);
  });

  it('refuses to directly change a booked slot', async () => {
    prismaMock.timeSlot.findFirst.mockResolvedValue({
      ...fakeSlot({ status: 'booked' }),
      venue: fakeVenue(),
    } as any);

    const res = await request(app)
      .patch('/api/v1/partner/slots/slot-1')
      .set(authHeader(PARTNER_ID))
      .send({ status: 'available' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(prismaMock.timeSlot.update).not.toHaveBeenCalled();
  });

  it('refuses to set an arbitrary status directly', async () => {
    prismaMock.timeSlot.findFirst.mockResolvedValue({ ...fakeSlot(), venue: fakeVenue() } as any);

    const res = await request(app)
      .patch('/api/v1/partner/slots/slot-1')
      .set(authHeader(PARTNER_ID))
      .send({ status: 'match_session' });

    expect(res.status).toBe(500);
    expect(prismaMock.timeSlot.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/partner/slots/blocks', () => {
  it('blocks an available slot', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot() as any);
    prismaMock.slotBlock.create.mockResolvedValue({ id: 'block-1', venueId: VENUE_ID, slotId: 'slot-1', reason: 'Maintenance' } as any);
    prismaMock.timeSlot.update.mockResolvedValue(fakeSlot({ status: 'blocked' }) as any);

    const res = await request(app)
      .post('/api/v1/partner/slots/blocks')
      .set(authHeader(PARTNER_ID))
      .send({ venueId: VENUE_ID, slotId: 'slot-1', reason: 'Maintenance' });

    expect(res.status).toBe(201);
    expect(prismaMock.timeSlot.update).toHaveBeenCalledWith({
      where: { id: 'slot-1' },
      data: { status: 'blocked' },
    });
  });

  it('refuses to block a slot that is already booked', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot({ status: 'booked' }) as any);

    const res = await request(app)
      .post('/api/v1/partner/slots/blocks')
      .set(authHeader(PARTNER_ID))
      .send({ venueId: VENUE_ID, slotId: 'slot-1', reason: 'Maintenance' });

    expect(res.status).toBe(500);
    expect(prismaMock.slotBlock.create).not.toHaveBeenCalled();
  });
});

describe('DELETE /api/v1/partner/slots/blocks/:blockId', () => {
  it('removes a block and frees the slot', async () => {
    prismaMock.slotBlock.findFirst.mockResolvedValue({ id: 'block-1', venueId: VENUE_ID, slotId: 'slot-1' } as any);
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.slotBlock.delete.mockResolvedValue({} as any);
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app).delete('/api/v1/partner/slots/blocks/block-1').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(prismaMock.timeSlot.updateMany).toHaveBeenCalledWith({
      where: { id: 'slot-1', status: 'blocked' },
      data: { status: 'available' },
    });
  });
});

describe('PATCH /api/v1/partner/venues/:venueId/bookings/:bookingId/cancel', () => {
  it('cancels a pending booking and frees its slot', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      venueId: VENUE_ID,
      slotId: 'slot-1',
      status: 'confirmed',
      guestName: 'Alice',
      guestPhone: '999',
    } as any);
    prismaMock.booking.update.mockResolvedValue({
      id: 'booking-1',
      venueId: VENUE_ID,
      slotId: 'slot-1',
      status: 'cancelled',
      guestName: 'Alice',
      guestPhone: '999',
    } as any);
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .patch(`/api/v1/partner/venues/${VENUE_ID}/bookings/booking-1/cancel`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
  });

  it('refuses to cancel an already-cancelled booking', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.booking.findFirst.mockResolvedValue({
      id: 'booking-1',
      venueId: VENUE_ID,
      slotId: 'slot-1',
      status: 'cancelled',
    } as any);

    const res = await request(app)
      .patch(`/api/v1/partner/venues/${VENUE_ID}/bookings/booking-1/cancel`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(400);
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/partner/match-sessions', () => {
  const validBody = {
    venueId: VENUE_ID,
    slotId: 'slot-1',
    date: '2026-07-14',
    startTime: '09:00',
    endTime: '09:30',
    sport: 'Football',
    totalPlayers: 10,
    minPlayersForLive: 6,
    pricePerPerson: 100,
    skillLevel: 'Open',
  };

  it('opens a match session on an available slot', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot() as any);
    prismaMock.matchSession.findFirst.mockResolvedValue(null);
    prismaMock.matchSession.create.mockResolvedValue({
      id: 'session-1',
      ...validBody,
      date: new Date('2026-07-14T00:00:00.000Z'),
      status: 'pending',
      playersJoined: 0,
    } as any);
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .post('/api/v1/partner/match-sessions')
      .set(authHeader(PARTNER_ID))
      .send(validBody);

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
  });

  it('refuses to open a session on a slot that is not available', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot({ status: 'booked' }) as any);

    const res = await request(app)
      .post('/api/v1/partner/match-sessions')
      .set(authHeader(PARTNER_ID))
      .send(validBody);

    expect(res.status).toBe(500);
    expect(prismaMock.matchSession.create).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/partner/venues/:venueId/match-sessions/:sessionId/status', () => {
  it('rejects an invalid status value', async () => {
    const res = await request(app)
      .patch(`/api/v1/partner/venues/${VENUE_ID}/match-sessions/session-1/status`)
      .set(authHeader(PARTNER_ID))
      .send({ status: 'bogus' });

    expect(res.status).toBe(400);
  });

  it('refuses to skip from pending straight to completed', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.matchSession.findFirst.mockResolvedValue({
      id: 'session-1',
      venueId: VENUE_ID,
      status: 'pending',
    } as any);

    const res = await request(app)
      .patch(`/api/v1/partner/venues/${VENUE_ID}/match-sessions/session-1/status`)
      .set(authHeader(PARTNER_ID))
      .send({ status: 'completed' });

    expect(res.status).toBe(400);
    expect(prismaMock.matchSession.update).not.toHaveBeenCalled();
  });

  it('allows pending -> live', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenue() as any);
    prismaMock.matchSession.findFirst.mockResolvedValue({
      id: 'session-1',
      venueId: VENUE_ID,
      status: 'pending',
    } as any);
    prismaMock.matchSession.update.mockResolvedValue({
      id: 'session-1',
      venueId: VENUE_ID,
      status: 'live',
      date: new Date('2026-07-14T00:00:00.000Z'),
    } as any);

    const res = await request(app)
      .patch(`/api/v1/partner/venues/${VENUE_ID}/match-sessions/session-1/status`)
      .set(authHeader(PARTNER_ID))
      .send({ status: 'live' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('live');
  });
});
