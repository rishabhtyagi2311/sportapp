import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { authHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

const PARTNER_ID = 'partner-1';

const openAllDay = { open: '06:00', close: '22:00', isOpen: true };
const operatingHours = {
  monday: openAllDay,
  tuesday: openAllDay,
  wednesday: openAllDay,
  thursday: openAllDay,
  friday: openAllDay,
  saturday: openAllDay,
  sunday: openAllDay,
};

function validVenuePayload(overrides: Partial<any> = {}) {
  return {
    name: 'Downtown Turf',
    description: 'A great turf',
    address: { street: '123 Main St', city: 'Mumbai', state: 'MH', pincode: '400001' },
    contactInfo: { phone: '9999999999' },
    operatingHours,
    sports: [
      {
        id: 'sport-1',
        name: 'Football',
        varieties: [{ id: 'variety-1', name: '5-a-side' }],
      },
    ],
    amenities: ['parking'],
    images: [],
    timeSlots: [{ price: 1000 }],
    ...overrides,
  };
}

function fakeVenueRow(overrides: Partial<any> = {}) {
  return {
    id: 'venue-1',
    name: 'Downtown Turf',
    description: 'A great turf',
    city: 'Mumbai',
    state: 'MH',
    pincode: '400001',
    contactInfo: { phone: '9999999999' },
    sports: [],
    amenities: [],
    operatingHours,
    peakPricing: null,
    rating: 0,
    isActive: true,
    partnerId: PARTNER_ID,
    address: { street: '123 Main St', lat: null, lng: null },
    images: [],
    timeSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/partner/venues', () => {
  it('creates a venue and generates its rolling slot window', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.venue.create.mockResolvedValue(fakeVenueRow());
    prismaMock.timeSlot.findMany.mockResolvedValue([]);
    prismaMock.timeSlot.createMany.mockResolvedValue({ count: 10 } as any);

    const res = await request(app)
      .post('/api/v1/partner/venues')
      .set(authHeader(PARTNER_ID))
      .send(validVenuePayload());

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('Downtown Turf');
    // Only a 3-day rolling window should ever be generated up front —
    // regression guard for the "30 days at creation" bug fixed this session.
    expect(prismaMock.timeSlot.createMany).toHaveBeenCalledTimes(1);
    const createManyArg = prismaMock.timeSlot.createMany.mock.calls[0][0] as any;
    const distinctDates = new Set(createManyArg.data.map((s: any) => s.date.toISOString().slice(0, 10)));
    expect(distinctDates.size).toBeLessThanOrEqual(3);
  });

  it('rejects invalid venue data', async () => {
    const res = await request(app)
      .post('/api/v1/partner/venues')
      .set(authHeader(PARTNER_ID))
      .send({ name: 'ab' }); // too short, missing required fields

    expect(res.status).toBe(400);
    expect(prismaMock.venue.create).not.toHaveBeenCalled();
  });

  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/partner/venues').send(validVenuePayload());
    expect(res.status).toBe(401);
  });
});

describe('GET /api/v1/partner/venues', () => {
  it("returns only the authenticated partner's venues", async () => {
    prismaMock.venue.findMany.mockResolvedValue([fakeVenueRow()] as any);

    const res = await request(app).get('/api/v1/partner/venues').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(res.body.count).toBe(1);
    expect(prismaMock.venue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { partnerId: PARTNER_ID } })
    );
  });
});

describe('GET /api/v1/partner/venues/:venueId', () => {
  it('returns 404 for a venue that does not exist or is not owned by the partner', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/partner/venues/missing-id').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(404);
  });

  it('returns the venue when found', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);

    const res = await request(app).get('/api/v1/partner/venues/venue-1').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('venue-1');
  });
});

describe('PUT /api/v1/partner/venues/:venueId', () => {
  it('rejects updates to a venue not owned by the partner', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/v1/partner/venues/venue-1')
      .set(authHeader(PARTNER_ID))
      .send({ name: 'New Name Ltd' });

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(prismaMock.venue.update).not.toHaveBeenCalled();
  });

  it('updates an owned venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);
    prismaMock.venue.update.mockResolvedValue(fakeVenueRow({ name: 'New Name Ltd' }) as any);

    const res = await request(app)
      .put('/api/v1/partner/venues/venue-1')
      .set(authHeader(PARTNER_ID))
      .send({ name: 'New Name Ltd' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('New Name Ltd');
  });
});

describe('DELETE /api/v1/partner/venues/:venueId', () => {
  it('deletes an owned venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);
    prismaMock.venue.delete.mockResolvedValue(fakeVenueRow() as any);

    const res = await request(app).delete('/api/v1/partner/venues/venue-1').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(prismaMock.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
  });

  it('rejects deleting a venue not owned by the partner', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/v1/partner/venues/venue-1').set(authHeader(PARTNER_ID));

    expect(res.status).toBe(500);
    expect(prismaMock.venue.delete).not.toHaveBeenCalled();
  });
});
