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
function fakeOrganizer(overrides = {}) {
    return {
        id: 1,
        firstname: 'Jane',
        lastname: 'Doe',
        email: 'jane@example.com',
        contact: '9999999999',
        city: 'Pune',
        dob: '2000-01-01',
        password: 'hashed',
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
function fakeEvent(overrides = {}) {
    return {
        id: 'event-1',
        creatorId: 1,
        venueId: null,
        locationName: 'Community Ground, Pune',
        name: 'Sunday Football 5-a-side',
        description: 'Casual weekend match',
        eventType: 'regular',
        tournamentFormat: null,
        sportName: 'Football',
        participationType: 'individual',
        teamSize: null,
        maxParticipants: 10,
        currentParticipants: 0,
        dateTime: new Date('2026-08-01T10:00:00Z'),
        duration: 60,
        feeAmount: 100,
        feeCurrency: 'INR',
        feeType: 'per_person',
        organizerName: 'Jane Doe',
        organizerContact: '9999999999',
        status: 'upcoming',
        isPublic: true,
        registrationDeadline: new Date('2026-07-31T00:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
function validEventPayload(overrides = {}) {
    return {
        eventType: 'regular',
        locationName: 'Community Ground, Pune',
        name: 'Sunday Football 5-a-side',
        sportName: 'Football',
        participationType: 'individual',
        maxParticipants: 10,
        dateTime: '2026-08-01T10:00:00Z',
        duration: 60,
        feeAmount: 100,
        feeType: 'per_person',
        registrationDeadline: '2026-07-31T00:00:00Z',
        ...overrides,
    };
}
describe('POST /api/v1/user/events', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/events').send(validEventPayload());
        expect(res.status).toBe(401);
    });
    it('creates an event, deriving organizer identity from the authenticated user', async () => {
        prismaMock_1.prismaMock.userInfo.findUnique.mockResolvedValue(fakeOrganizer());
        prismaMock_1.prismaMock.event.create.mockResolvedValue(fakeEvent());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events')
            .set((0, auth_1.userAuthHeader)(1))
            .send(validEventPayload());
        expect(res.status).toBe(201);
        expect(res.body.data.organizerName).toBe('Jane Doe');
        expect(prismaMock_1.prismaMock.event.create).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.objectContaining({ creatorId: 1, organizerName: 'Jane Doe', organizerContact: '9999999999' }),
        }));
    });
    it('rejects a footballtournament event with no tournamentFormat', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events')
            .set((0, auth_1.userAuthHeader)(1))
            .send(validEventPayload({ eventType: 'footballtournament', participationType: 'team', teamSize: 7 }));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.create).not.toHaveBeenCalled();
    });
    it('rejects an event with neither venueId nor locationName', async () => {
        const payload = validEventPayload();
        delete payload.locationName;
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/events').set((0, auth_1.userAuthHeader)(1)).send(payload);
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.create).not.toHaveBeenCalled();
    });
});
describe('GET /api/v1/user/events', () => {
    it('lists public, non-cancelled events without requiring auth', async () => {
        prismaMock_1.prismaMock.event.findMany.mockResolvedValue([fakeEvent()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/events');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(prismaMock_1.prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ isPublic: true, status: { not: 'cancelled' } }),
        }));
    });
});
describe('GET /api/v1/user/events/mine', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/events/mine');
        expect(res.status).toBe(401);
    });
    it("returns the authenticated user's created events", async () => {
        prismaMock_1.prismaMock.event.findMany.mockResolvedValue([fakeEvent()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/events/mine').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.event.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { creatorId: 1 } }));
    });
});
describe('GET /api/v1/user/events/:id', () => {
    it('returns 404 for a missing event', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/events/event-404');
        expect(res.status).toBe(404);
    });
});
describe('PUT /api/v1/user/events/:id', () => {
    it('rejects updating an event owned by another user', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/user/events/event-1')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ name: 'Renamed' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.update).not.toHaveBeenCalled();
    });
    it('updates an owned event', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.event.update.mockResolvedValue(fakeEvent({ name: 'Renamed' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/user/events/event-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ name: 'Renamed' });
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Renamed');
    });
    it('rejects reviving a completed event back to upcoming', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent({ status: 'completed' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/user/events/event-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'upcoming' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.update).not.toHaveBeenCalled();
    });
    it('rejects reviving a cancelled event', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent({ status: 'cancelled' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/user/events/event-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'ongoing' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.update).not.toHaveBeenCalled();
    });
    it('allows a valid forward status transition', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent({ status: 'upcoming' }));
        prismaMock_1.prismaMock.event.update.mockResolvedValue(fakeEvent({ status: 'ongoing' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/user/events/event-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'ongoing' });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('ongoing');
    });
});
describe('DELETE /api/v1/user/events/:id', () => {
    it('rejects deleting an event owned by another user', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/user/events/event-1').set((0, auth_1.userAuthHeader)(2));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.delete).not.toHaveBeenCalled();
    });
    it('deletes an owned event', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.event.delete.mockResolvedValue(fakeEvent());
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/user/events/event-1').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
    });
});
//# sourceMappingURL=user.event.test.js.map