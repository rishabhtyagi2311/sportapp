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
function fakeTeam(overrides = {}) {
    return { id: 10, name: 'Thunder FC', location: 'Pune', maxPlayers: 11, createdById: 1, ...overrides };
}
function fakeTournament(overrides = {}) {
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
function fakeRoster(overrides = {}) {
    return { startingXI: [1, 2], bench: [3], captainId: 1, subsUsed: 0, ...overrides };
}
function fakeMatch(overrides = {}) {
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
        duration: 60,
        penaltyHomeScore: null,
        penaltyAwayScore: null,
        ...overrides,
    };
}
describe('POST /api/v1/user/football/tournaments', () => {
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/tournaments').send({});
        expect(res.status).toBe(401);
    });
    it('rejects a knockout tournament with a non-power-of-2 team count', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/tournaments')
            .set((0, auth_1.userAuthHeader)(1))
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
        prismaMock_1.prismaMock.footballTeam.findMany.mockResolvedValue([
            fakeTeam({ id: 10 }),
            fakeTeam({ id: 20 }),
            fakeTeam({ id: 30 }),
            fakeTeam({ id: 40 }),
        ]);
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.tournament.create.mockResolvedValue(fakeTournament());
        prismaMock_1.prismaMock.tournamentEntry.createMany.mockResolvedValue({ count: 4 });
        prismaMock_1.prismaMock.tournamentFixture.createMany.mockResolvedValue({ count: 6 });
        prismaMock_1.prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/tournaments')
            .set((0, auth_1.userAuthHeader)(1))
            .send({
            name: 'Summer Cup',
            format: 'league',
            teamIds: [10, 20, 30, 40],
            playersPerTeam: 7,
            allowedSubs: 3,
            extraTimeAllowed: false,
        });
        expect(res.status).toBe(201);
        expect(prismaMock_1.prismaMock.tournamentFixture.createMany).toHaveBeenCalledTimes(1);
        const fixtures = prismaMock_1.prismaMock.tournamentFixture.createMany.mock.calls[0][0].data;
        expect(fixtures).toHaveLength(6); // 4 teams -> 4*3/2 pairs
        const pairKeys = fixtures.map((f) => [f.homeTeamId, f.awayTeamId].sort().join('-'));
        expect(new Set(pairKeys).size).toBe(6); // every pair appears exactly once
        const rounds = new Set(fixtures.map((f) => f.round));
        expect(rounds).toEqual(new Set([1, 2, 3])); // n-1 rounds, no team plays twice per round
    });
    it('creates a knockout tournament with a chained bracket for 4 teams', async () => {
        prismaMock_1.prismaMock.footballTeam.findMany.mockResolvedValue([
            fakeTeam({ id: 10 }),
            fakeTeam({ id: 20 }),
            fakeTeam({ id: 30 }),
            fakeTeam({ id: 40 }),
        ]);
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.tournament.create.mockResolvedValue(fakeTournament({ format: 'knockout' }));
        prismaMock_1.prismaMock.tournamentEntry.createMany.mockResolvedValue({ count: 4 });
        let counter = 0;
        prismaMock_1.prismaMock.tournamentFixture.create.mockImplementation(({ data }) => {
            counter++;
            return Promise.resolve({ id: `fixture-${counter}`, ...data });
        });
        prismaMock_1.prismaMock.tournamentFixture.update.mockResolvedValue({});
        prismaMock_1.prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament({ format: 'knockout' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/tournaments')
            .set((0, auth_1.userAuthHeader)(1))
            .send({
            name: 'Knockout Cup',
            format: 'knockout',
            teamIds: [10, 20, 30, 40],
            playersPerTeam: 7,
            allowedSubs: 3,
            extraTimeAllowed: false,
        });
        expect(res.status).toBe(201);
        expect(prismaMock_1.prismaMock.tournamentFixture.create).toHaveBeenCalledTimes(3); // 2 round-1 + 1 final
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
            where: { id: 'fixture-1' },
            data: { nextFixtureId: 'fixture-3' },
        });
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
            where: { id: 'fixture-2' },
            data: { nextFixtureId: 'fixture-3' },
        });
    });
});
describe('POST /api/v1/user/football/tournaments/:id/start', () => {
    it('rejects starting a tournament not owned by the requester', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/tournaments/tourney-1/start').set((0, auth_1.userAuthHeader)(2));
        expect(res.status).toBe(400);
    });
    it('transitions a draft tournament to ongoing', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament());
        prismaMock_1.prismaMock.tournament.update.mockResolvedValue(fakeTournament({ status: 'ongoing' }));
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/tournaments/tourney-1/start').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('ongoing');
    });
});
describe('POST /api/v1/user/football/tournaments/:id/fixtures/:fixtureId/start-match', () => {
    it('rejects starting a fixture that is not ready', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament());
        prismaMock_1.prismaMock.tournamentFixture.findFirst.mockResolvedValue({ id: 'fixture-1', status: 'pending', homeTeamId: null, awayTeamId: null });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/start-match')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ duration: 60, homeRoster: fakeRoster(), awayRoster: fakeRoster(), referees: [] });
        expect(res.status).toBe(400);
    });
    it('creates the underlying match, links it to the fixture, and starts it', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament());
        prismaMock_1.prismaMock.tournamentFixture.findFirst.mockResolvedValue({
            id: 'fixture-1',
            status: 'ready',
            homeTeamId: 10,
            awayTeamId: 20,
        });
        prismaMock_1.prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 10 }));
        prismaMock_1.prismaMock.footballTeam.findUnique.mockResolvedValueOnce(fakeTeam({ id: 20 }));
        prismaMock_1.prismaMock.match.create.mockResolvedValue(fakeMatch({ status: 'scheduled' }));
        prismaMock_1.prismaMock.tournamentFixture.update.mockResolvedValue({});
        prismaMock_1.prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ status: 'scheduled' }));
        prismaMock_1.prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'live' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/tournaments/tourney-1/fixtures/fixture-1/start-match')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ duration: 60, homeRoster: fakeRoster(), awayRoster: fakeRoster({ startingXI: [4, 5], bench: [6], captainId: 4 }), referees: [] });
        expect(res.status).toBe(201);
        expect(res.body.data.status).toBe('live');
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
            where: { id: 'fixture-1' },
            data: { matchId: 'match-1' },
        });
    });
});
describe('DELETE /api/v1/user/football/tournaments/:id', () => {
    it('rejects deleting a tournament that already started', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament({ status: 'ongoing' }));
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/user/football/tournaments/tourney-1').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.tournament.delete).not.toHaveBeenCalled();
    });
    it('deletes a draft tournament owned by the requester', async () => {
        prismaMock_1.prismaMock.tournament.findFirst.mockResolvedValue(fakeTournament());
        prismaMock_1.prismaMock.tournament.delete.mockResolvedValue(fakeTournament());
        const res = await (0, supertest_1.default)(app_1.default).delete('/api/v1/user/football/tournaments/tourney-1').set((0, auth_1.userAuthHeader)(1));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.tournament.delete).toHaveBeenCalledWith({ where: { id: 'tourney-1' } });
    });
});
describe('GET /api/v1/user/football/tournaments/:id', () => {
    it('returns 404 for a missing tournament', async () => {
        prismaMock_1.prismaMock.tournament.findUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/football/tournaments/nope');
        expect(res.status).toBe(404);
    });
    it('returns full tournament detail', async () => {
        prismaMock_1.prismaMock.tournament.findUnique.mockResolvedValue(fakeTournament());
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/football/tournaments/tourney-1');
        expect(res.status).toBe(200);
        expect(res.body.data.name).toBe('Summer Cup');
    });
});
describe('POST /api/v1/user/football/matches/:id/end — tournament fixture hook', () => {
    it('updates league standings for both teams and completes the tournament once every fixture is done', async () => {
        prismaMock_1.prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 2, awayScore: 1 }));
        prismaMock_1.prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
            id: 'fixture-1',
            tournamentId: 'tourney-1',
            nextFixtureId: null,
            tournament: fakeTournament({ format: 'league' }),
        });
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchEvent.findMany.mockResolvedValue([]);
        prismaMock_1.prismaMock.footballTeam.update.mockResolvedValue({});
        prismaMock_1.prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }));
        prismaMock_1.prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 });
        prismaMock_1.prismaMock.tournamentFixture.update.mockResolvedValue({});
        prismaMock_1.prismaMock.tournamentFixture.count.mockResolvedValue(0);
        prismaMock_1.prismaMock.tournament.update.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/matches/match-1/end').set((0, auth_1.userAuthHeader)(1)).send({});
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
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
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({ where: { id: 'fixture-1' }, data: { status: 'completed' } });
        expect(prismaMock_1.prismaMock.tournament.update).toHaveBeenCalledWith({ where: { id: 'tourney-1' }, data: { status: 'completed' } });
    });
    it('rejects ending a tied knockout match without penalty scores', async () => {
        prismaMock_1.prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 1, awayScore: 1 }));
        prismaMock_1.prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
            id: 'fixture-1',
            tournamentId: 'tourney-1',
            nextFixtureId: 'fixture-3',
            tournament: fakeTournament({ format: 'knockout' }),
        });
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/matches/match-1/end').set((0, auth_1.userAuthHeader)(1)).send({});
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/penalty/i);
        expect(prismaMock_1.prismaMock.match.update).not.toHaveBeenCalled();
    });
    it('accepts a tied knockout match once penalty scores are provided', async () => {
        prismaMock_1.prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 1, awayScore: 1 }));
        prismaMock_1.prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
            id: 'fixture-1',
            tournamentId: 'tourney-1',
            nextFixtureId: null,
            tournament: fakeTournament({ format: 'knockout' }),
        });
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchEvent.findMany.mockResolvedValue([]);
        prismaMock_1.prismaMock.footballTeam.update.mockResolvedValue({});
        prismaMock_1.prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed', penaltyHomeScore: 5, penaltyAwayScore: 4 }));
        prismaMock_1.prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 });
        prismaMock_1.prismaMock.tournamentFixture.update.mockResolvedValue({});
        prismaMock_1.prismaMock.tournament.update.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/football/matches/match-1/end')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ penaltyHomeScore: 5, penaltyAwayScore: 4 });
        expect(res.status).toBe(200);
        // Home team (10) won on penalties -> away team (20) eliminated, home team marked winner (final fixture).
        expect(prismaMock_1.prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
            where: { tournamentId: 'tourney-1', teamId: 20 },
            data: { status: 'eliminated' },
        });
        expect(prismaMock_1.prismaMock.tournamentEntry.updateMany).toHaveBeenCalledWith({
            where: { tournamentId: 'tourney-1', teamId: 10 },
            data: { status: 'winner' },
        });
    });
    it('advances the winner into the next fixture and marks it ready once both slots are filled', async () => {
        prismaMock_1.prismaMock.match.findFirst.mockResolvedValue(fakeMatch({ homeScore: 2, awayScore: 1 }));
        prismaMock_1.prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({
            id: 'fixture-1',
            tournamentId: 'tourney-1',
            nextFixtureId: 'fixture-3',
            tournament: fakeTournament({ format: 'knockout' }),
        });
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.matchEvent.findMany.mockResolvedValue([]);
        prismaMock_1.prismaMock.footballTeam.update.mockResolvedValue({});
        prismaMock_1.prismaMock.match.update.mockResolvedValue(fakeMatch({ status: 'completed' }));
        prismaMock_1.prismaMock.tournamentEntry.updateMany.mockResolvedValue({ count: 1 });
        // Second findUnique call (inside applyFixtureResult) fetches the next fixture.
        prismaMock_1.prismaMock.tournamentFixture.findUnique.mockResolvedValueOnce({ id: 'fixture-3', homeTeamId: 30, awayTeamId: null });
        prismaMock_1.prismaMock.tournamentFixture.update
            .mockResolvedValueOnce({ id: 'fixture-1', status: 'completed' })
            .mockResolvedValueOnce({ id: 'fixture-3', homeTeamId: 30, awayTeamId: 10 })
            .mockResolvedValueOnce({ id: 'fixture-3', status: 'ready' });
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/user/football/matches/match-1/end').set((0, auth_1.userAuthHeader)(1)).send({});
        expect(res.status).toBe(200);
        // Home team (10) won -> advances into the next fixture's open (away) slot.
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
            where: { id: 'fixture-3' },
            data: { awayTeamId: 10 },
        });
        expect(prismaMock_1.prismaMock.tournamentFixture.update).toHaveBeenCalledWith({
            where: { id: 'fixture-3' },
            data: { status: 'ready' },
        });
    });
});
//# sourceMappingURL=user.tournament.test.js.map