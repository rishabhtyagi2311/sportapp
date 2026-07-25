"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
beforeEach(() => {
    (0, prismaMock_1.resetPrismaMock)();
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
        prismaMock_1.prismaMock.venue.findMany.mockResolvedValue([fakeVenueRow()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/venues');
        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveLength(1);
        // Every query for public browse must filter on isActive: true.
        expect(prismaMock_1.prismaMock.venue.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ isActive: true }) }));
    });
});
describe('GET /api/v1/user/venues/:id', () => {
    it('returns an active venue', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow());
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/venues/venue-1');
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe('venue-1');
    });
    it('returns 404 for an inactive or missing venue', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/venues/venue-404');
        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
    });
});
describe('GET /api/v1/user/venues/:id/slots', () => {
    it('returns slots for an active venue', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(fakeVenueRow());
        prismaMock_1.prismaMock.timeSlot.findMany.mockResolvedValue([
            { id: 'slot-1', venueId: 'venue-1', status: 'available', price: 1000 },
        ]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/venues/venue-1/slots');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });
    it('returns 404 when the venue is inactive or missing', async () => {
        prismaMock_1.prismaMock.venue.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/venues/venue-404/slots');
        expect(res.status).toBe(404);
    });
});
//# sourceMappingURL=user.venue.test.js.map