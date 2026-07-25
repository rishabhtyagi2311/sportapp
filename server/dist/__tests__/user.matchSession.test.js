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
function fakeSession(overrides = {}) {
    return {
        id: 'session-1',
        venueId: 'venue-1',
        slotId: 'slot-1',
        partnerId: 'partner-1',
        date: new Date('2026-08-01'),
        startTime: '18:00',
        endTime: '19:00',
        sport: 'Football',
        totalPlayers: 10,
        minPlayersForLive: 6,
        pricePerPerson: 100,
        skillLevel: 'Open',
        description: '',
        status: 'pending',
        playersJoined: 4,
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
describe('GET /api/v1/user/match-sessions', () => {
    it('lists available sessions without requiring auth', async () => {
        prismaMock_1.prismaMock.matchSession.findMany.mockResolvedValue([fakeSession()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/match-sessions');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(prismaMock_1.prismaMock.matchSession.findMany).toHaveBeenCalledWith(expect.objectContaining({
            where: expect.objectContaining({ status: { in: ['pending', 'live'] } }),
        }));
    });
});
describe('GET /api/v1/user/match-sessions/:sessionId', () => {
    it('fetches a single session by id without requiring auth', async () => {
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession());
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/match-sessions/session-1');
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe('session-1');
    });
    it('returns 404 for an unknown session id', async () => {
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/match-sessions/unknown-id');
        expect(res.status).toBe(404);
    });
});
describe('POST /api/v1/user/match-sessions/:sessionId/join', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/match-sessions/session-1/join');
        expect(res.status).toBe(401);
    });
    it('joins a pending session with room available', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession());
        prismaMock_1.prismaMock.matchSessionParticipant.findUnique.mockResolvedValue(null);
        prismaMock_1.prismaMock.matchSessionParticipant.create.mockResolvedValue({});
        prismaMock_1.prismaMock.matchSession.update.mockResolvedValue(fakeSession({ playersJoined: 5 }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/join')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(res.body.data.playersJoined).toBe(5);
        expect(prismaMock_1.prismaMock.matchSessionParticipant.create).toHaveBeenCalledWith({
            data: { matchSessionId: 'session-1', userId: 1, status: 'joined' },
        });
    });
    it('rejects joining a full session', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession({ playersJoined: 10, totalPlayers: 10 }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/join')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.matchSessionParticipant.create).not.toHaveBeenCalled();
    });
    it('rejects a duplicate join from the same user', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession());
        prismaMock_1.prismaMock.matchSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            matchSessionId: 'session-1',
            userId: 1,
            status: 'joined',
            joinedAt: new Date(),
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/join')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/already joined/i);
    });
    it('rejects joining a completed session', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession({ status: 'completed' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/join')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(400);
    });
});
describe('POST /api/v1/user/match-sessions/:sessionId/leave', () => {
    it('leaves a pending session', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession());
        prismaMock_1.prismaMock.matchSessionParticipant.findUnique.mockResolvedValue({
            id: 'participant-1',
            matchSessionId: 'session-1',
            userId: 1,
            status: 'joined',
            joinedAt: new Date(),
        });
        prismaMock_1.prismaMock.matchSessionParticipant.update.mockResolvedValue({});
        prismaMock_1.prismaMock.matchSession.update.mockResolvedValue(fakeSession({ playersJoined: 3 }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/leave')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(res.body.data.playersJoined).toBe(3);
    });
    it('rejects leaving a live session', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession({ status: 'live' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/match-sessions/session-1/leave')
            .set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.matchSessionParticipant.update).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=user.matchSession.test.js.map