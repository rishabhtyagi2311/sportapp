import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeTeam(overrides: Partial<any> = {}) {
  return { id: 10, name: 'Thunder FC', location: 'Pune', maxPlayers: 11, createdById: 1, ...overrides };
}

function fakeRoster(overrides: Partial<any> = {}) {
  return { startingXI: [1, 2], bench: [3], captainId: 1, subsUsed: 0, ...overrides };
}

function fakeMatch(overrides: Partial<any> = {}) {
  return {
    id: 'match-1',
    creatorId: 1,
    homeTeamId: 10,
    awayTeamId: 20,
    matchType: 'friendly',
    venueName: 'Community Ground',
    playersPerTeam: 7,
    allowedSubs: 3,
    extraTimeAllowed: false,
    duration: 60,
    homeRoster: fakeRoster(),
    awayRoster: fakeRoster({ startingXI: [4, 5], bench: [6], captainId: 4 }),
    referees: ['John Doe'],
    status: 'scheduled',
    homeScore: 0,
    awayScore: 0,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
    currentMinute: 0,
    currentPossessionTeamId: null,
    lastPossessionChangeSeconds: 0,
    homePossessionSeconds: 0,
    awayPossessionSeconds: 0,
    startedAt: null,
    endedAt: null,
    notes: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeEvent(overrides: Partial<any> = {}) {
  return {
    id: 'event-1',
    matchId: 'match-1',
    teamId: 10,
    playerId: 1,
    relatedPlayerId: null,
    eventType: 'goal',
    eventSubType: null,
    minute: 10,
    seconds: 0,
    notes: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/user/football/matches', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/football/matches').send({});
    expect(res.status).toBe(401);
  });

  it('creates a scheduled match with both teams validated', async () => {
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 10 }) as any);
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 20, name: 'Lightning FC' }) as any);
    prismaMock.match.create.mockResolvedValue(fakeMatch() as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches')
      .set(userAuthHeader(1))
      .send({
        homeTeamId: 10,
        awayTeamId: 20,
        playersPerTeam: 7,
        allowedSubs: 3,
        duration: 60,
        homeRoster: fakeRoster(),
        awayRoster: fakeRoster({ startingXI: [4, 5], bench: [6], captainId: 4 }),
        referees: ['John Doe'],
      });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('scheduled');
  });

  it('rejects when a team does not exist', async () => {
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(null);
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 20 }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches')
      .set(userAuthHeader(1))
      .send({
        homeTeamId: 10,
        awayTeamId: 20,
        playersPerTeam: 7,
        allowedSubs: 3,
        duration: 60,
        homeRoster: fakeRoster(),
        awayRoster: fakeRoster(),
        referees: [],
      });

    expect(res.status).toBe(400);
    expect(prismaMock.match.create).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/user/football/matches/:id/start', () => {
  it('rejects starting a match not owned by the requester', async () => {
    prismaMock.match.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/start').set(userAuthHeader(2));

    expect(res.status).toBe(400);
  });

  it('transitions a scheduled match to live', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch() as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'live', startedAt: new Date() }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/start').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('live');
  });

  it('rejects starting a match that is already live', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/start').set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.match.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/user/football/matches/:id/abandon', () => {
  it('marks a live match abandoned', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'abandoned', endedAt: new Date() }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/abandon')
      .set(userAuthHeader(1))
      .send({ reason: 'Rain' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('abandoned');
  });

  it('rejects abandoning an already-completed match', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'completed' }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/abandon').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(400);
    expect(prismaMock.match.update).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/user/football/matches/:id/events', () => {
  it('rejects adding events to a non-live match', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'scheduled' }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/events')
      .set(userAuthHeader(1))
      .send({ teamId: 10, playerId: 1, eventType: 'goal', minute: 10, seconds: 0 });

    expect(res.status).toBe(400);
  });

  it('atomically increments the scoring team on a goal event', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.create.mockResolvedValue(fakeEvent() as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/events')
      .set(userAuthHeader(1))
      .send({ teamId: 10, playerId: 1, eventType: 'goal', minute: 10, seconds: 0 });

    expect(res.status).toBe(201);
    expect(prismaMock.match.update).toHaveBeenCalledWith({
      where: { id: 'match-1' },
      data: { homeScore: { increment: 1 } },
    });
  });

  it('credits an own_goal to the opposing team score', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.create.mockResolvedValue(fakeEvent({ eventType: 'own_goal' }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/events')
      .set(userAuthHeader(1))
      .send({ teamId: 10, playerId: 1, eventType: 'own_goal', minute: 10, seconds: 0 });

    expect(res.status).toBe(201);
    expect(prismaMock.match.update).toHaveBeenCalledWith({
      where: { id: 'match-1' },
      data: { awayScore: { increment: 1 } },
    });
  });

  it('does not touch the score for a card event', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.create.mockResolvedValue(fakeEvent({ eventType: 'yellow_card' }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/events')
      .set(userAuthHeader(1))
      .send({ teamId: 10, playerId: 1, eventType: 'yellow_card', minute: 10, seconds: 0 });

    expect(res.status).toBe(201);
    expect(prismaMock.match.update).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/user/football/matches/:id/possession', () => {
  it('accrues elapsed seconds to the previous possession holder before flipping', async () => {
    prismaMock.match.findFirst.mockResolvedValue(
      fakeMatch({ status: 'live', currentPossessionTeamId: 10, lastPossessionChangeSeconds: 100, homePossessionSeconds: 50 }) as any
    );
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.match.update.mockResolvedValue(fakeMatch({ homePossessionSeconds: 80, currentPossessionTeamId: 20 }) as any);

    const res = await request(app)
      .patch('/api/v1/user/football/matches/match-1/possession')
      .set(userAuthHeader(1))
      .send({ teamId: 20, currentSeconds: 130 });

    expect(res.status).toBe(200);
    expect(prismaMock.match.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          homePossessionSeconds: 80,
          currentPossessionTeamId: 20,
          lastPossessionChangeSeconds: 130,
        }),
      })
    );
  });
});

describe('POST /api/v1/user/football/matches/:id/end', () => {
  it('rejects ending a non-live match', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'scheduled' }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(400);
  });

  it('computes player stats, increments team counters, and completes the match atomically', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live', homeScore: 2, awayScore: 1 }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([
      fakeEvent({ eventType: 'goal', playerId: 1, teamId: 10, minute: 10 }),
      fakeEvent({ id: 'event-2', eventType: 'goal', playerId: 1, relatedPlayerId: 2, teamId: 10, minute: 20 }),
    ] as any);
    prismaMock.matchPlayerStat.createMany.mockResolvedValue({ count: 4 } as any);
    prismaMock.footballTeam.update.mockResolvedValue(fakeTeam() as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed', endedAt: new Date() }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('completed');

    // Player 1 scored twice, player 2 assisted once.
    expect(prismaMock.matchPlayerStat.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ playerId: 1, goals: 2, isStarter: true }),
        expect.objectContaining({ playerId: 2, assists: 1 }),
      ]),
    });

    // Home team (10) won 2-1.
    expect(prismaMock.footballTeam.update).toHaveBeenCalledWith({
      where: { id: 10 },
      data: { matchesPlayed: { increment: 1 }, matchesWon: { increment: 1 }, matchesLost: { increment: 0 }, matchesDrawn: { increment: 0 } },
    });
    expect(prismaMock.footballTeam.update).toHaveBeenCalledWith({
      where: { id: 20 },
      data: { matchesPlayed: { increment: 1 }, matchesWon: { increment: 0 }, matchesLost: { increment: 1 }, matchesDrawn: { increment: 0 } },
    });
  });

  it('marks both teams drawn when the score is level', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live', homeScore: 1, awayScore: 1 }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([] as any);
    prismaMock.footballTeam.update.mockResolvedValue(fakeTeam() as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }) as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(200);
    expect(prismaMock.footballTeam.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 10 }, data: expect.objectContaining({ matchesDrawn: { increment: 1 } }) })
    );
  });

  it('accounts for a substitution when computing minutes played', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'live' }) as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([
      fakeEvent({ eventType: 'substitution', playerId: 3, relatedPlayerId: 2, teamId: 10, minute: 40 }),
    ] as any);
    prismaMock.footballTeam.update.mockResolvedValue(fakeTeam() as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }) as any);

    await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(prismaMock.matchPlayerStat.createMany).toHaveBeenCalledWith({
      data: expect.arrayContaining([
        expect.objectContaining({ playerId: 2, minutesPlayed: 40, isStarter: true }), // subbed off at minute 40
        expect.objectContaining({ playerId: 3, minutesPlayed: 20, isStarter: false }), // came on for the remaining 20 (duration 60)
      ]),
    });
  });
});

describe('GET /api/v1/user/football/matches/:id', () => {
  it('returns 404 for a missing match', async () => {
    prismaMock.match.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/football/matches/nope');

    expect(res.status).toBe(404);
  });

  it('returns full match detail including events and stats', async () => {
    prismaMock.match.findUnique.mockResolvedValue({ ...fakeMatch(), events: [fakeEvent()], stats: [] } as any);

    const res = await request(app).get('/api/v1/user/football/matches/match-1');

    expect(res.status).toBe(200);
    expect(res.body.data.events).toHaveLength(1);
  });
});

describe('GET /api/v1/user/football/matches/mine', () => {
  it('unifies matches created by the user and matches involving their teams', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue({ id: 1, userId: 1 } as any);
    prismaMock.footballTeam.findMany.mockResolvedValue([{ id: 10 }] as any);
    prismaMock.match.findMany.mockResolvedValue([fakeMatch()] as any);

    const res = await request(app).get('/api/v1/user/football/matches/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(prismaMock.match.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ creatorId: 1 }, { homeTeamId: { in: [10] } }, { awayTeamId: { in: [10] } }] },
      })
    );
  });
});
