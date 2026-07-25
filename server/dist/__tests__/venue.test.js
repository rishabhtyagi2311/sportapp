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
function validVenuePayload(overrides = {}) {
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
function fakeVenueRow(overrides = {}) {
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
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.venue.create.mockResolvedValue(fakeVenueRow());
        prismaMock_1.prismaMock.timeSlot.findMany.mockResolvedValue([]);
        prismaMock_1.prismaMock.timeSlot.createMany.mockResolvedValue({ count: 10 });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/partner/venues')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send(validVenuePayload());
        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.name).toBe('Downtown Turf');
        // Only a 3-day rolling window should ever be generated up front —
        // regression guard for the "30 days at creation" bug fixed this session.
        expect(prismaMock_1.prismaMock.timeSlot.createMany).toHaveBeenCalledTimes(1);
        const createManyArg = prismaMock_1.prismaMock.timeSlot.createMany.mock.calls[0][0];
        const distinctDates = new Set(createManyArg.data.map((s) => s.date.toISOString().slice(0, 10)));
        expect(distinctDates.size).toBeLessThanOrEqual(3);
    });
    it('rejects invalid venue data', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/partner/venues')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'ab' }); // too short, missing required fields
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.venue.create).not.toHaveBeenCalled();
    });
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/venues').send(validVenuePayload());
        expect(res.status).toBe(401);
    });
});
describe('GET /api/v1/partner/venues', () => {
    it("returns only the authenticated partner's venues", async () => {
        prismaMock_1.prismaMock.venue.findMany.mockResolvedValue([fakeVenueRow()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/venues').set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.count).toBe(1);
        expect(prismaMock_1.prismaMock.venue.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { partnerId: PARTNER_ID } }));
    });
});
describe('GET /api/v1/partner/venues/:venueId', () => {
    it('returns 404 for a venue that does not exist or is not owned by the partner', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/venues/missing-id').set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(404);
    });
    it('returns the venue when found', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow());
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/venues/venue-1').set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe('venue-1');
    });
});
describe('PUT /api/v1/partner/venues/:venueId', () => {
    it('rejects updates to a venue not owned by the partner', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/partner/venues/venue-1')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'New Name Ltd' });
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
        expect(prismaMock_1.prismaMock.venue.update).not.toHaveBeenCalled();
    });
    it('updates an owned venue', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow());
        prismaMock_1.prismaMock.venue.update.mockResolvedValue(fakeVenueRow({ name: 'New Name Ltd' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/partner/venues/venue-1')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'New Name Ltd' });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('New Name Ltd');
    });
});
describe('DELETE /api/v1/partner/venues/:venueId', () => {
    it('deletes an owned venue', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow());
        prismaMock_1.prismaMock.venue.delete.mockResolvedValue(fakeVenueRow());
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/partner/venues/venue-1').set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.venue.delete).toHaveBeenCalledWith({ where: { id: 'venue-1' } });
    });
    it('rejects deleting a venue not owned by the partner', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/partner/venues/venue-1').set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(500);
        expect(prismaMock_1.prismaMock.venue.delete).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=venue.test.js.map