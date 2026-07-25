import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeSlot(overrides: Partial<any> = {}) {
  return {
    id: 'slot-1',
    venueId: 'venue-1',
    date: new Date('2026-08-01'),
    startTime: '10:00',
    endTime: '11:00',
    price: 1000,
    status: 'available',
    venue: { id: 'venue-1', isActive: true },
    ...overrides,
  };
}

function fakeBooking(overrides: Partial<any> = {}) {
  return {
    id: 'booking-1',
    venueId: 'venue-1',
    userId: 1,
    slotId: 'slot-1',
    date: new Date('2026-08-01'),
    startTime: '10:00',
    endTime: '11:00',
    totalAmount: 1000,
    status: 'confirmed',
    paymentStatus: 'pending',
    bookingType: 'venue',
    participants: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/user/bookings', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/bookings').send({ venueId: 'venue-1', slotId: 'slot-1' });
    expect(res.status).toBe(401);
  });

  it('creates a confirmed booking for an available slot', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot() as any);
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 } as any);
    prismaMock.booking.create.mockResolvedValue(fakeBooking() as any);

    const res = await request(app)
      .post('/api/v1/user/bookings')
      .set(userAuthHeader(1))
      .send({ venueId: 'venue-1', slotId: 'slot-1' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('confirmed');
    expect(prismaMock.timeSlot.updateMany).toHaveBeenCalledWith({
      where: { id: 'slot-1', status: 'available' },
      data: { status: 'booked' },
    });
  });

  it('rejects a double-booking race on the same slot', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot() as any);
    // Another request already claimed the slot between the read and the write.
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 0 } as any);

    const res = await request(app)
      .post('/api/v1/user/bookings')
      .set(userAuthHeader(1))
      .send({ venueId: 'venue-1', slotId: 'slot-1' });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(prismaMock.booking.create).not.toHaveBeenCalled();
  });

  it('rejects booking a slot on an inactive venue', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot({ venue: { id: 'venue-1', isActive: false } }) as any);

    const res = await request(app)
      .post('/api/v1/user/bookings')
      .set(userAuthHeader(1))
      .send({ venueId: 'venue-1', slotId: 'slot-1' });

    expect(res.status).toBe(400);
    expect(prismaMock.timeSlot.updateMany).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/bookings', () => {
  it('returns only the authenticated user\'s bookings', async () => {
    prismaMock.booking.findMany.mockResolvedValue([fakeBooking()] as any);

    const res = await request(app).get('/api/v1/user/bookings').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(prismaMock.booking.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });
});

describe('PATCH /api/v1/user/bookings/:bookingId/cancel', () => {
  it('cancels a booking owned by the requesting user and frees the slot', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(fakeBooking() as any);
    prismaMock.booking.update.mockResolvedValue(fakeBooking({ status: 'cancelled' }) as any);
    prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 } as any);

    const res = await request(app)
      .patch('/api/v1/user/bookings/booking-1/cancel')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('cancelled');
    expect(prismaMock.timeSlot.updateMany).toHaveBeenCalledWith({
      where: { id: 'slot-1', status: 'booked' },
      data: { status: 'available' },
    });
  });

  it('rejects cancelling a booking that belongs to another user', async () => {
    prismaMock.booking.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/bookings/booking-1/cancel')
      .set(userAuthHeader(2));

    expect(res.status).toBe(400);
    expect(prismaMock.booking.update).not.toHaveBeenCalled();
  });
});
