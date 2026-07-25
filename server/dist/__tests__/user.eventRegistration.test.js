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
function fakeEvent(overrides = {}) {
    return {
        id: 'event-1',
        creatorId: 1,
        venueId: null,
        locationName: 'Community Ground, Pune',
        name: 'Sunday Football 5-a-side',
        eventType: 'regular',
        participationType: 'individual',
        maxParticipants: 10,
        currentParticipants: 0,
        dateTime: new Date('2026-08-01T10:00:00Z'),
        duration: 60,
        status: 'upcoming',
        isPublic: true,
        registrationDeadline: new Date('2099-01-01T00:00:00Z'),
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
function fakeFootballProfile(overrides = {}) {
    return { id: 10, userId: 2, nickname: 'Speedy', role: 'forward', experience: '3 years', ...overrides };
}
function fakeTeam(overrides = {}) {
    return { id: 100, name: 'Thunder FC', location: 'Pune', maxPlayers: 11, createdById: 10, ...overrides };
}
function fakeRegistration(overrides = {}) {
    return {
        id: 'reg-1',
        eventId: 'event-1',
        userId: 2,
        footballTeamId: null,
        status: 'pending',
        notes: null,
        processedAt: null,
        processedBy: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
describe('POST /api/v1/user/events/:id/registrations', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .send({ participationType: 'individual' });
        expect(res.status).toBe(401);
    });
    it('creates an individual registration', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.eventRegistration.create.mockResolvedValue(fakeRegistration());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'individual' });
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('pending');
    });
    it('rejects registering for a non-upcoming event', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ status: 'completed' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'individual' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.eventRegistration.create).not.toHaveBeenCalled();
    });
    it('rejects registering after the registration deadline', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ registrationDeadline: new Date('2000-01-01T00:00:00Z') }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'individual' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/deadline/i);
    });
    it('rejects a duplicate individual registration', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.eventRegistration.create.mockRejectedValue({ code: 'P2002' });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'individual' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already registered/i);
    });
    it('registers a team when the requester is the team captain', async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ participationType: 'team' }));
        prismaMock_1.prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile());
        prismaMock_1.prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam());
        prismaMock_1.prismaMock.eventRegistration.create.mockResolvedValue(fakeRegistration({ userId: null, footballTeamId: 100 }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'team', footballTeamId: 100 });
        expect(res.status).toBe(201);
        expect(prismaMock_1.prismaMock.eventRegistration.create).toHaveBeenCalledWith(expect.objectContaining({ data: expect.objectContaining({ footballTeamId: 100 }) }));
    });
    it("rejects a team registration from someone who isn't the team's captain", async () => {
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ participationType: 'team' }));
        prismaMock_1.prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile({ id: 999 }));
        prismaMock_1.prismaMock.footballTeam.findUnique.mockResolvedValue(fakeTeam());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/events/event-1/registrations')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ participationType: 'team', footballTeamId: 100 });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/captain/i);
        expect(prismaMock_1.prismaMock.eventRegistration.create).not.toHaveBeenCalled();
    });
});
describe('GET /api/v1/user/registrations/mine', () => {
    it('unifies individual registrations and team-captain registrations', async () => {
        prismaMock_1.prismaMock.footballProfile.findUnique.mockResolvedValue(fakeFootballProfile());
        prismaMock_1.prismaMock.eventRegistration.findMany.mockResolvedValue([
            fakeRegistration({ id: 'reg-1', userId: 2 }),
            fakeRegistration({ id: 'reg-2', userId: null, footballTeamId: 100 }),
        ]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/registrations/mine').set((0, auth_1.userAuthHeader)(2));
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(prismaMock_1.prismaMock.eventRegistration.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: { OR: [{ userId: 2 }, { footballTeam: { createdById: 10 } }] },
        }));
    });
});
describe('PATCH /api/v1/user/events/:id/registrations/:registrationId', () => {
    it('rejects processing for an event not owned by the requester', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/events/event-1/registrations/reg-1')
            .set((0, auth_1.userAuthHeader)(2))
            .send({ status: 'accepted' });
        expect(res.status).toBe(400);
    });
    it('accepts a pending registration and atomically increments currentParticipants', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration());
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.event.update.mockResolvedValue(fakeEvent({ currentParticipants: 1 }));
        prismaMock_1.prismaMock.eventRegistration.update.mockResolvedValue(fakeRegistration({ status: 'accepted' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/events/event-1/registrations/reg-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'accepted' });
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('accepted');
        expect(prismaMock_1.prismaMock.event.update).toHaveBeenCalledWith({
            where: { id: 'event-1' },
            data: { currentParticipants: { increment: 1 } },
        });
    });
    it('rejects accepting into a full event', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration());
        prismaMock_1.prismaMock.event.findUnique.mockResolvedValue(fakeEvent({ currentParticipants: 10, maxParticipants: 10 }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/events/event-1/registrations/reg-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'accepted' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/full/i);
        expect(prismaMock_1.prismaMock.eventRegistration.update).not.toHaveBeenCalled();
    });
    it('rejects processing a non-pending registration', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration({ status: 'accepted' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/events/event-1/registrations/reg-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'rejected' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.event.update).not.toHaveBeenCalled();
    });
    it('does not touch currentParticipants when rejecting', async () => {
        prismaMock_1.prismaMock.event.findFirst.mockResolvedValue(fakeEvent());
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.eventRegistration.findFirst.mockResolvedValue(fakeRegistration());
        prismaMock_1.prismaMock.eventRegistration.update.mockResolvedValue(fakeRegistration({ status: 'rejected' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch('/api/v1/user/events/event-1/registrations/reg-1')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ status: 'rejected', notes: 'Not enough experience' });
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.event.update).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=user.eventRegistration.test.js.map