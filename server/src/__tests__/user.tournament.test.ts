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

function fakeTournament(overrides: Partial<any> = {}) {
  return {
    id: 'tourney-1',
    creatorId: 1,
    name: 'Summer Cup',
    description: null,
    format: 'league',
    teamCount: 4,
    matchesPerPair: 1,
    extraTimeAllowed: false,
    playersPerTeam: 7,
    allowedSubs: 3,
    venueName: null,
    status: 'draft',
    currentRound: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    entries: [],
    fixtures: [],
    ...overrides,
  };
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
    status: 'live',
    homeScore: 2,
    awayScore: 1,
    homeRoster: fakeRoster(),
    awayRoster: fakeRoster({ startingXI: [4, 5], bench: [6], captainId: 4 }),
    playersPerTeam: 7,
    allowedSubs: 3,
    duration: 60,
    penaltyHomeScore: null,
    penaltyAwayScore: null,
    ...overrides,
  };
}

describe('POST /api/v1/user/football/tournaments', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/football/tournaments').send({});
    expect(res.status).toBe(401);
  });

  it('rejects a knockout tournament with a non-power-of-2 team count', async () => {
    const res = await request(app)
      .post('/api/v1/user/football/tournaments')
      .set(userAuthHeader(1))
      .send({
        name: 'Bad Cup',
        format: 'knockout',
        teamIds: [10, 20, 30],
        playersPerTeam: 7,
        allowedSubs: 3,
        extraTimeAllowed: false,
      });

    expect(res.status).toBe(400);
  });

  it('creates a league tournament with round-robin fixtures covering every pair exactly once', async () => {
    prismaMock.footballTeam.findMany.mockResolvedValue([
      fakeTeam({ id: 10 }),
      fakeTeam({ id: 20 }),
      fakeTeam({ id: 30 }),
      fakeTeam({ id: 40 }),
    ] as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.tournament.create.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentEntry.createMany.mockResolvedValue({ count: 4 } as any);
    prismaMock.tournamentFixture.createMany.mockResolvedValue({ count: 6 } as any);
    prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament() as any);

    const res = await request(app)
      .post('/api/v1/user/football/tournaments')
      .set(userAuthHeader(1))
      .send({
        name: 'Summer Cup',
        format: 'league',
        teamIds: [10, 20, 30, 40],
        playersPerTeam: 7,
        allowedSubs: 3,
        extraTimeAllowed: false,
      });

    expect(res.status).toBe(201);
    expect(prismaMock.tournamentFixture.createMany).toHaveBeenCalledTimes(1);

    const fixtures = (prismaMock.tournamentFixture.createMany as jest.Mock).mock.calls[0][0].data;
    expect(fixtures).toHaveLength(6); // 4 teams -> 4*3/2 pairs

    const pairKeys = fixtures.map((f: any) => [f.homeTeamId, f.awayTeamId].sort().join('-'));
    expect(new Set(pairKeys).size).toBe(6); // every pair appears exactly once

    const rounds = new Set(fixtures.map((f: any) => f.round));
    expect(rounds).toEqual(new Set([1, 2, 3])); // n-1 rounds, no team plays twice per round
  });

  it('creates a knockout tournament with a chained bracket for 4 teams, batched in one createMany call', async () => {
    prismaMock.footballTeam.findMany.mockResolvedValue([
      fakeTeam({ id: 10 }),
      fakeTeam({ id: 20 }),
      fakeTeam({ id: 30 }),
      fakeTeam({ id: 40 }),
    ] as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.tournament.create.mockResolvedValue(fakeTournament({ format: 'knockout' }) as any);
    prismaMock.tournamentEntry.createMany.mockResolvedValue({ count: 4 } as any);
    prismaMock.tournamentFixture.createMany.mockResolvedValue({ count: 3 } as any);
    prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament({ format: 'knockout' }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/tournaments')
      .set(userAuthHeader(1))
      .send({
        name: 'Knockout Cup',
        format: 'knockout',
        teamIds: [10, 20, 30, 40],
        playersPerTeam: 7,
        allowedSubs: 3,
        extraTimeAllowed: false,
      });

    expect(res.status).toBe(201);
    // The whole bracket (round-1 pairs + the final) is created in a single
    // batched call — no more one-fixture-at-a-time create/update round trips.
    expect(prismaMock.tournamentFixture.create).not.toHaveBeenCalled();
    expect(prismaMock.tournamentFixture.update).not.toHaveBeenCalled();
    expect(prismaMock.tournamentFixture.createMany).toHaveBeenCalledTimes(1);

    const fixtures = (prismaMock.tournamentFixture.createMany as jest.Mock).mock.calls[0][0].data;
    expect(fixtures).toHaveLength(3); // 2 round-1 + 1 final

    const round1 = fixtures.filter((f: any) => f.round === 1);
    const round2 = fixtures.filter((f: any) => f.round === 2);
    expect(round1).toHaveLength(2);
    expect(round2).toHaveLength(1);

    // Both round-1 fixtures have real teams and feed into the same final.
    const finalId = round2[0].id;
    expect(round2[0].nextFixtureId).toBeNull();
    expect(round2[0].homeTeamId).toBeNull();
    expect(round2[0].awayTeamId).toBeNull();
    round1.forEach((f: any) => {
      expect(f.status).toBe('ready');
      expect(f.nextFixtureId).toBe(finalId);
      expect([10, 20, 30, 40]).toContain(f.homeTeamId);
      expect([10, 20, 30, 40]).toContain(f.awayTeamId);
    });

    // All fixture ids are distinct, valid UUIDs.
    const ids = fixtures.map((f: any) => f.id);
    expect(new Set(ids).size).toBe(3);
    ids.forEach((id: string) => expect(id).toMatch(/^[0-9a-f-]{36}$/));
  });
});

describe('POST /api/v1/user/football/tournaments/:id/start', () => {
  it('rejects starting a tournament not owned by the requester', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/user/football/tournaments/tourney-1/start').set(userAuthHeader(2));

    expect(res.status).toBe(400);
  });

  it('transitions a draft tournament to ongoing', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournament.update.mockResolvedValue(fakeTournament({ status: 'ongoing' }) as any);

    const res = await request(app).post('/api/v1/user/football/tournaments/tourney-1/start').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ongoing');
  });
});

describe('POST /api/v1/user/football/tournaments/:id/fixtures/:fixtureId/start-match', () => {
  it('rejects starting a fixture that is not ready', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue({ id: 'fixture-1', status: 'pending', homeTeamId: null, awayTeamId: null } as any);

    const res = await request(app)
      .post('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/start-match')
      .set(userAuthHeader(1))
      .send({ duration: 60, homeRoster: fakeRoster(), awayRoster: fakeRoster(), referees: [] });

    expect(res.status).toBe(400);
  });

  it('creates the underlying match, links it to the fixture, and starts it', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue({
      id: 'fixture-1',
      status: 'ready',
      homeTeamId: 10,
      awayTeamId: 20,
    } as any);
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 10 }) as any);
    prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 20 }) as any);
    prismaMock.match.create.mockResolvedValue(fakeMatch({ status: 'scheduled' }) as any);
    prismaMock.tournamentFixture.update.mockResolvedValue({} as any);
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'scheduled' }) as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'live' }) as any);

    const res = await request(app)
      .post('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/start-match')
      .set(userAuthHeader(1))
      .send({ duration: 60, homeRoster: fakeRoster(), awayRoster: fakeRoster({ startingXI: [4, 5], bench: [6], captainId: 4 }), referees: [] });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('live');
    expect(prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
      where: { id: 'fixture-1' },
      data: { matchId: 'match-1' },
    });
  });
});

describe('PATCH /api/v1/user/football/tournaments/:id/fixtures/:fixtureId/schedule', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z' });
    expect(res.status).toBe(401);
  });

  it('rejects setting a schedule on a tournament not owned by the requester', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .set(userAuthHeader(2))
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z' });

    expect(res.status).toBe(400);
    expect(prismaMock.tournament.update).not.toHaveBeenCalled();
  });

  it('rejects a fixture that is not found', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .set(userAuthHeader(1))
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z' });

    expect(res.status).toBe(400);
    expect(prismaMock.tournament.update).not.toHaveBeenCalled();
  });

  it('rejects setting a schedule once the fixture already has a match', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue({ id: 'fixture-1', status: 'ready', matchId: 'match-1' } as any);

    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .set(userAuthHeader(1))
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z' });

    expect(res.status).toBe(400);
    expect(prismaMock.tournament.update).not.toHaveBeenCalled();
  });

  it('rejects setting a schedule on a completed fixture', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue({ id: 'fixture-1', status: 'completed', matchId: null } as any);

    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .set(userAuthHeader(1))
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z' });

    expect(res.status).toBe(400);
    expect(prismaMock.tournament.update).not.toHaveBeenCalled();
  });

  it('sets the date and venue on a not-yet-started fixture', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournamentFixture.findFirst.mockResolvedValue({ id: 'fixture-1', status: 'ready', matchId: null } as any);
    prismaMock.tournament.update.mockResolvedValue(fakeTournament() as any);

    const res = await request(app)
      .patch('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/schedule')
      .set(userAuthHeader(1))
      .send({ scheduledAt: '2026-09-01T10:00:00.000Z', venueName: 'Community Ground' });

    expect(res.status).toBe(200);
    expect(prismaMock.tournament.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'tourney-1' },
        data: {
          fixtures: {
            update: {
              where: { id: 'fixture-1' },
              data: { scheduledAt: new Date('2026-09-01T10:00:00.000Z'), venueName: 'Community Ground' },
            },
          },
        },
      })
    );
  });
});

describe('GET /api/v1/user/football/tournaments/mine', () => {
  it('includes tournaments the user did not create but has a team entered in', async () => {
    prismaMock.footballProfile.findUnique.mockResolvedValue({ id: 10 } as any);
    prismaMock.footballTeam.findMany.mockResolvedValue([{ id: 10 }] as any);
    prismaMock.tournament.findMany.mockResolvedValue([fakeTournament({ creatorId: 99 })] as any);

    const res = await request(app).get('/api/v1/user/football/tournaments/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(prismaMock.tournament.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { OR: [{ creatorId: 1 }, { entries: { some: { teamId: { in: [10] } } } }] },
      })
    );
  });
});

describe('DELETE /api/v1/user/football/tournaments/:id', () => {
  it('rejects deleting a tournament that already started', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament({ status: 'ongoing' }) as any);

    const res = await request(app).delete('/api/v1/user/football/tournaments/tourney-1').set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.tournament.delete).not.toHaveBeenCalled();
  });

  it('deletes a draft tournament owned by the requester', async () => {
    prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament() as any);
    prismaMock.tournament.delete.mockResolvedValue(fakeTournament() as any);

    const res = await request(app).delete('/api/v1/user/football/tournaments/tourney-1').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(prismaMock.tournament.delete).toHaveBeenCalledWith({ where: { id: 'tourney-1' } });
  });
});

describe('GET /api/v1/user/football/tournaments/:id', () => {
  it('returns 404 for a missing tournament', async () => {
    prismaMock.tournament.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/football/tournaments/nope');

    expect(res.status).toBe(404);
  });

  it('returns full tournament detail', async () => {
    prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament() as any);

    const res = await request(app).get('/api/v1/user/football/tournaments/tourney-1');

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Summer Cup');
  });
});

describe('POST /api/v1/user/football/matches/:id/end — tournament fixture hook', () => {
  it('updates league standings for both teams and completes the tournament once every fixture is done', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 2, awayScore: 1 }) as any);
    prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
      id: 'fixture-1',
      tournamentId: 'tourney-1',
      nextFixtureId: null,
      tournament: fakeTournament({ format: 'league' }),
    } as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([] as any);
    prismaMock.footballTeam.update.mockResolvedValue({} as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }) as any);
    prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 } as any);
    prismaMock.tournamentFixture.update.mockResolvedValue({} as any);
    prismaMock.tournamentFixture.count.mockResolvedValue(0);
    prismaMock.tournament.update.mockResolvedValue({} as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(200);
    expect(prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
      where: { tournamentId: 'tourney-1', teamId: 10 },
      data: {
        played: { increment: 1 },
        won: { increment: 1 },
        drawn: { increment: 0 },
        lost: { increment: 0 },
        goalsFor: { increment: 2 },
        goalsAgainst: { increment: 1 },
        points: { increment: 3 },
      },
    });
    expect(prismaMock.tournamentFixture.update).toHaveBeenCalledWith({ where: { id: 'fixture-1' }, data: { status: 'completed' } });
    expect(prismaMock.tournament.update).toHaveBeenCalledWith({ where: { id: 'tourney-1' }, data: { status: 'completed' } });
  });

  it('rejects ending a tied knockout match without penalty scores', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 1, awayScore: 1 }) as any);
    prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
      id: 'fixture-1',
      tournamentId: 'tourney-1',
      nextFixtureId: 'fixture-3',
      tournament: fakeTournament({ format: 'knockout' }),
    } as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/penalty/i);
    expect(prismaMock.match.update).not.toHaveBeenCalled();
  });

  it('accepts a tied knockout match once penalty scores are provided', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 1, awayScore: 1 }) as any);
    prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
      id: 'fixture-1',
      tournamentId: 'tourney-1',
      nextFixtureId: null,
      tournament: fakeTournament({ format: 'knockout' }),
    } as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([] as any);
    prismaMock.footballTeam.update.mockResolvedValue({} as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed', penaltyHomeScore: 5, penaltyAwayScore: 4 }) as any);
    prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 } as any);
    prismaMock.tournamentFixture.update.mockResolvedValue({} as any);
    prismaMock.tournament.update.mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/v1/user/football/matches/match-1/end')
      .set(userAuthHeader(1))
      .send({ penaltyHomeScore: 5, penaltyAwayScore: 4 });

    expect(res.status).toBe(200);
    // Home team (10) won on penalties -> away team (20) eliminated, home team marked winner (final fixture).
    expect(prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
      where: { tournamentId: 'tourney-1', teamId: 20 },
      data: { status: 'eliminated' },
    });
    expect(prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
      where: { tournamentId: 'tourney-1', teamId: 10 },
      data: { status: 'winner' },
    });
  });

  it('advances the winner into the next fixture and marks it ready once both slots are filled', async () => {
    prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 2, awayScore: 1 }) as any);
    prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
      id: 'fixture-1',
      tournamentId: 'tourney-1',
      nextFixtureId: 'fixture-3',
      tournament: fakeTournament({ format: 'knockout' }),
    } as any);
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.matchEvent.findMany.mockResolvedValue([] as any);
    prismaMock.footballTeam.update.mockResolvedValue({} as any);
    prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }) as any);
    prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 } as any);
    // Second findUnique call (inside applyFixtureResult) fetches the next fixture.
    prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({ id: 'fixture-3', homeTeamId: 30, awayTeamId: null } as any);
    prismaMock.tournamentFixture.update
      .mockResolvedValueOnce({ id: 'fixture-1', status: 'completed' } as any)
      .mockResolvedValueOnce({ id: 'fixture-3', homeTeamId: 30, awayTeamId: 10 } as any)
      .mockResolvedValueOnce({ id: 'fixture-3', status: 'ready' } as any);

    const res = await request(app).post('/api/v1/user/football/matches/match-1/end').set(userAuthHeader(1)).send({});

    expect(res.status).toBe(200);
    // Home team (10) won -> advances into the next fixture's open (away) slot.
    expect(prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
      where: { id: 'fixture-3' },
      data: { awayTeamId: 10 },
    });
    expect(prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
      where: { id: 'fixture-3' },
      data: { status: 'ready' },
    });
  });
});
