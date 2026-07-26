import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';

beforeEach(() => {
  resetPrismaMock();
});

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
    partnerId: 'partner-1',
    address: { street: '123 Main St', lat: null, lng: null },
    images: [],
    timeSlots: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('GET /api/v1/user/venues', () => {
  it('lists active venues without requiring auth', async () => {
    prismaMock.venue.findMany.mockResolvedValue([fakeVenueRow()] as any);

    const res = await request(app).get('/api/v1/user/venues');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    // Every query for public browse must filter on isActive: true.
    expect(prismaMock.venue.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });
});

describe('GET /api/v1/user/venues/:id', () => {
  it('returns an active venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);

    const res = await request(app).get('/api/v1/user/venues/venue-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('venue-1');
  });

  it('returns 404 for an inactive or missing venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/venues/venue-404');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/user/venues/:id/slots', () => {
  it('returns slots for an active venue', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);
    prismaMock.timeSlot.findMany.mockResolvedValue([
      { id: 'slot-1', venueId: 'venue-1', status: 'available', price: 1000 },
    ] as any);

    const res = await request(app).get('/api/v1/user/venues/venue-1/slots');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 404 when the venue is inactive or missing', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/venues/venue-404/slots');

    expect(res.status).toBe(404);
  });

  it('self-heals by generating slots on demand when a date inside the rolling window has none yet', async () => {
    const venue = fakeVenueRow({
      sports: [{ id: 's1', varieties: [{ id: 'v1', name: 'Turf' }] }],
    });
    prismaMock.venue.findFirst.mockResolvedValue(venue as any);

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const dateStr = today.toISOString().split('T')[0];

    prismaMock.timeSlot.findMany
      .mockResolvedValueOnce([]) // initial query: background job hasn't topped this day up yet
      .mockResolvedValueOnce([]) // dedup check inside generateSlotsForRange
      .mockResolvedValueOnce([
        { id: 'slot-new', venueId: 'venue-1', date: today, status: 'available', price: 1000 },
      ] as any); // re-query after on-demand generation
    prismaMock.timeSlot.findFirst.mockResolvedValue({ price: 1000 } as any);
    prismaMock.timeSlot.createMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app).get(`/api/v1/user/venues/venue-1/slots?date=${dateStr}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.timeSlot.createMany).toHaveBeenCalled();
  });

  it('does not self-heal for a date outside the rolling window', async () => {
    prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow() as any);
    prismaMock.timeSlot.findMany.mockResolvedValue([]);

    const farFuture = new Date();
    farFuture.setUTCDate(farFuture.getUTCDate() + 30);
    const dateStr = farFuture.toISOString().split('T')[0];

    const res = await request(app).get(`/api/v1/user/venues/venue-1/slots?date=${dateStr}`);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(prismaMock.timeSlot.createMany).not.toHaveBeenCalled();
  });
});
