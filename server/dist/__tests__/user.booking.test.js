"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const auth_1 = require("./helpers/auth");
beforeEach(() => {
    (0, prismaMock_1.resetPrismaMock)();
});
function fakeSlot(overrides = {}) {
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
function fakeBooking(overrides = {}) {
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
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/bookings').send({ venueId: 'venue-1', slotId: 'slot-1' });
        expect(res.status).toBe(401);
    });
    it('creates a confirmed booking for an available slot', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot());
        prismaMock_1.prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 });
        prismaMock_1.prismaMock.booking.create.mockResolvedValue(fakeBooking());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/bookings')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ venueId: 'venue-1', slotId: 'slot-1' });
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('confirmed');
        expect(prismaMock_1.prismaMock.timeSlot.updateMany).toHaveBeenCalledWith({
            where: { id: 'slot-1', status: 'available' },
            data: { status: 'booked' },
        });
    });
    it('rejects a double-booking race on the same slot', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot());
        // Another request already claimed the slot between the read and the write.
        prismaMock_1.prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 0 });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/bookings')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ venueId: 'venue-1', slotId: 'slot-1' });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(prismaMock_1.prismaMock.booking.create).not.toHaveBeenCalled();
    });
    it('rejects booking a slot on an inactive venue', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.timeSlot.findFirst.mockResolvedValue(fakeSlot({ venue: { id: 'venue-1', isActive: false } }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/bookings')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ venueId: 'venue-1', slotId: 'slot-1' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.timeSlot.updateMany).not.toHaveBeenCalled();
    });
});
describe('GET /api/v1/user/bookings', () => {
    it('returns only the authenticated user\'s bookings', async () => {
        prismaMock_1.prismaMock.booking.findMany.mockResolvedValue([fakeBooking()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/bookings').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.booking.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 1 } }));
    });
});
describe('PATCH /api/v1/user/bookings/:bookingId/cancel', () => {
    it('cancels a booking owned by the requesting user and frees the slot', async () => {
        prismaMock_1.prismaMock.booking.findFirst.mockResolvedValue(fakeBooking());
        prismaMock_1.prismaMock.booking.update.mockResolvedValue(fakeBooking({ status: 'cancelled' }));
        prismaMock_1.prismaMock.timeSlot.updateMany.mockResolvedValue({ count: 1 });
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/bookings/booking-1/cancel')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('cancelled');
        expect(prismaMock_1.prismaMock.timeSlot.updateMany).toHaveBeenCalledWith({
            where: { id: 'slot-1', status: 'booked' },
            data: { status: 'available' },
        });
    });
    it('rejects cancelling a booking that belongs to another user', async () => {
        prismaMock_1.prismaMock.booking.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/bookings/booking-1/cancel')
            .set((0, auth_1.userAuthHeader)(2));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.booking.update).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=user.booking.test.js.map