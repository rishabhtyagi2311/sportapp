import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeSession(overrides: Partial<any> = {}) {
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
    prismaMock.matchSession.findMany.mockResolvedValue([fakeSession()] as any);

    const res = await request(app).get('/api/v1/user/match-sessions');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.matchSession.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: { in: ['pending', 'live'] } }),
      })
    );
  });
});

describe('GET /api/v1/user/match-sessions/:sessionId', () => {
  it('fetches a single session by id without requiring auth', async () => {
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession() as any);

    const res = await request(app).get('/api/v1/user/match-sessions/session-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('session-1');
  });

  it('returns 404 for an unknown session id', async () => {
    prismaMock.matchSession.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/match-sessions/unknown-id');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/v1/user/match-sessions/:sessionId/join', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/match-sessions/session-1/join');
    expect(res.status).toBe(401);
  });

  it('joins a pending session with room available', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession() as any);
    prismaMock.matchSessionParticipant.findUnique.mockResolvedValue(null);
    prismaMock.matchSessionParticipant.create.mockResolvedValue({} as any);
    prismaMock.matchSession.update.mockResolvedValue(fakeSession({ playersJoined: 5 }) as any);

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/join')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.playersJoined).toBe(5);
    expect(prismaMock.matchSessionParticipant.create).toHaveBeenCalledWith({
      data: { matchSessionId: 'session-1', userId: 1, status: 'joined' },
    });
  });

  it('rejects joining a full session', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(
      fakeSession({ playersJoined: 10, totalPlayers: 10 }) as any
    );

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/join')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.matchSessionParticipant.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate join from the same user', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession() as any);
    prismaMock.matchSessionParticipant.findUnique.mockResolvedValue({
      id: 'participant-1',
      matchSessionId: 'session-1',
      userId: 1,
      status: 'joined',
      joinedAt: new Date(),
    } as any);

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/join')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already joined/i);
  });

  it('rejects joining a completed session', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession({ status: 'completed' }) as any);

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/join')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
  });
});

describe('POST /api/v1/user/match-sessions/:sessionId/leave', () => {
  it('leaves a pending session', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession() as any);
    prismaMock.matchSessionParticipant.findUnique.mockResolvedValue({
      id: 'participant-1',
      matchSessionId: 'session-1',
      userId: 1,
      status: 'joined',
      joinedAt: new Date(),
    } as any);
    prismaMock.matchSessionParticipant.update.mockResolvedValue({} as any);
    prismaMock.matchSession.update.mockResolvedValue(fakeSession({ playersJoined: 3 }) as any);

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/leave')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.playersJoined).toBe(3);
  });

  it('rejects leaving a live session', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchSession.findUnique.mockResolvedValue(fakeSession({ status: 'live' }) as any);

    const res = await request(app)
      .post('/api/v1/user/match-sessions/session-1/leave')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.matchSessionParticipant.update).not.toHaveBeenCalled();
  });
});
