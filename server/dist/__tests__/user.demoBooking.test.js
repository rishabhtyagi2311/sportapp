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
function fakeChildProfile(overrides = {}) {
    return {
        id: 'child-1',
        parentId: 1,
        childName: 'Timmy',
        childAge: 10,
        fatherName: 'Jane Doe',
        fatherContact: '9999999999',
        ...overrides,
    };
}
function fakeAcademy(overrides = {}) {
    return { id: 'academy-1', partnerId: 'partner-1', academyName: 'Champions Academy', isActive: true, ...overrides };
}
function fakeDemoBooking(overrides = {}) {
    return {
        id: 'demo-1',
        childProfileId: 'child-1',
        academyId: 'academy-1',
        bookingDate: new Date('2026-08-01'),
        status: 'pending',
        createdAt: new Date(),
        academy: fakeAcademy(),
        childProfile: fakeChildProfile(),
        ...overrides,
    };
}
describe('POST /api/v1/user/demo-bookings', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/demo-bookings')
            .send({ childProfileId: 'child-1', academyId: 'academy-1', bookingDate: '2026-08-01' });
        expect(res.status).toBe(401);
    });
    it('creates a pending demo booking', async () => {
        prismaMock_1.prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile());
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.demoBooking.create.mockResolvedValue(fakeDemoBooking());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/demo-bookings')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ childProfileId: 'child-1', academyId: 'academy-1', bookingDate: '2026-08-01' });
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('pending');
        expect(res.body.data.academyName).toBe('Champions Academy');
    });
    it('rejects booking a demo for a child profile that is not the requesting parent\'s', async () => {
        prismaMock_1.prismaMock.childProfile.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/demo-bookings')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ childProfileId: 'child-1', academyId: 'academy-1', bookingDate: '2026-08-01' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.demoBooking.create).not.toHaveBeenCalled();
    });
});
describe('PATCH /api/v1/user/demo-bookings/:bookingId/cancel', () => {
    it('cancels a pending demo booking owned by the requesting parent', async () => {
        prismaMock_1.prismaMock.demoBooking.findFirst.mockResolvedValue(fakeDemoBooking());
        prismaMock_1.prismaMock.demoBooking.update.mockResolvedValue(fakeDemoBooking({ status: 'cancelled' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/demo-bookings/demo-1/cancel')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('cancelled');
    });
    it('rejects cancelling a demo booking belonging to another parent', async () => {
        prismaMock_1.prismaMock.demoBooking.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/demo-bookings/demo-1/cancel')
            .set((0, auth_1.userAuthHeader)(2));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.demoBooking.update).not.toHaveBeenCalled();
    });
});
describe('Partner demo booking management', () => {
    it('lists demo bookings for an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.demoBooking.findMany.mockResolvedValue([fakeDemoBooking()]);
        const { authHeader } = require('./helpers/auth');
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/partner/academies/academy-1/demo-bookings')
            .set(authHeader('partner-1'));
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });
    it('rejects listing demo bookings for an academy owned by another partner', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(null);
        const { authHeader } = require('./helpers/auth');
        const res = await (0, supertest_1.default)(app_1.default)
            .get('/api/v1/partner/academies/academy-1/demo-bookings')
            .set(authHeader('partner-2'));
        expect(res.status).toBe(500);
    });
    it('confirms a pending demo booking', async () => {
        prismaMock_1.prismaMock.demoBooking.findFirst.mockResolvedValue(fakeDemoBooking());
        prismaMock_1.prismaMock.demoBooking.update.mockResolvedValue(fakeDemoBooking({ status: 'confirmed' }));
        const { authHeader } = require('./helpers/auth');
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/partner/demo-bookings/demo-1/confirm')
            .set(authHeader('partner-1'));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('confirmed');
    });
    it('rejects completing a booking that is still pending', async () => {
        prismaMock_1.prismaMock.demoBooking.findFirst.mockResolvedValue(fakeDemoBooking({ status: 'pending' }));
        const { authHeader } = require('./helpers/auth');
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/partner/demo-bookings/demo-1/complete')
            .set(authHeader('partner-1'));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.demoBooking.update).not.toHaveBeenCalled();
    });
    it('rejects managing a demo booking for an academy owned by another partner', async () => {
        prismaMock_1.prismaMock.demoBooking.findFirst.mockResolvedValue(null);
        const { authHeader } = require('./helpers/auth');
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/partner/demo-bookings/demo-1/confirm')
            .set(authHeader('partner-2'));
        expect(res.status).toBe(400);
    });
});
//# sourceMappingURL=user.demoBooking.test.js.map