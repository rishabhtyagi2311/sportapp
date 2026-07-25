"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TournamentService = void 0;
const index_1 = require("../../../index");
const match_1 = require("../matchManagement/match");
const tournamentInclude = {
    entries: { include: { team: { select: { id: true, name: true, location: true } } } },
    fixtures: {
        include: {
            homeTeam: { select: { id: true, name: true } },
            awayTeam: { select: { id: true, name: true } },
        },
    },
};
function mapTournamentForClient(tournament) {
    return {
        ...tournament,
        createdAt: tournament.createdAt?.toISOString?.() ?? tournament.createdAt,
        updatedAt: tournament.updatedAt?.toISOString?.() ?? tournament.updatedAt,
    };
}
/** Standard circle-method round-robin scheduler. Returns fixtures spread
 *  across `n-1` matchdays (rounds) so no team plays twice in the same round;
 *  when `matchesPerPair > 1`, later cycles repeat the same pairings with
 *  home/away reversed on odd repeats. */
function generateRoundRobinFixtures(teamIds, matchesPerPair) {
    const teams = [...teamIds];
    const hasBye = teams.length % 2 !== 0;
    if (hasBye)
        teams.push(-1);
    const n = teams.length;
    const roundsPerCycle = n - 1;
    const half = n / 2;
    const fixtures = [];
    let arr = [...teams];
    for (let round = 0; round < roundsPerCycle; round++) {
        for (let i = 0; i < half; i++) {
            const home = arr[i];
            const away = arr[n - 1 - i];
            if (home !== -1 && away !== -1) {
                fixtures.push({ round: round + 1, homeTeamId: home, awayTeamId: away });
            }
        }
        const fixed = arr[0];
        const rest = arr.slice(1);
        rest.unshift(rest.pop());
        arr = [fixed, ...rest];
    }
    for (let rep = 1; rep < matchesPerPair; rep++) {
        const swap = rep % 2 === 1;
        fixtures
            .filter((f) => f.round <= roundsPerCycle)
            .forEach((f) => {
            fixtures.push({
                round: f.round + roundsPerCycle * rep,
                homeTeamId: swap ? f.awayTeamId : f.homeTeamId,
                awayTeamId: swap ? f.homeTeamId : f.awayTeamId,
            });
        });
    }
    return fixtures;
}
class TournamentService {
    static async createTournament(userId, data) {
        const teams = await index_1.prisma.footballTeam.findMany({ where: { id: { in: data.teamIds } } });
        if (teams.length !== data.teamIds.length) {
            throw new Error("One or more teams could not be found");
        }
        return index_1.prisma.$transaction(async (tx) => {
            const tournament = await tx.tournament.create({
                data: {
                    creatorId: userId,
                    name: data.name,
                    description: data.description,
                    format: data.format,
                    teamCount: data.teamIds.length,
                    matchesPerPair: data.format === "league" ? data.matchesPerPair ?? 1 : null,
                    extraTimeAllowed: data.extraTimeAllowed,
                    playersPerTeam: data.playersPerTeam,
                    allowedSubs: data.allowedSubs,
                    venueName: data.venueName,
                },
            });
            await tx.tournamentEntry.createMany({
                data: data.teamIds.map((teamId, idx) => ({
                    tournamentId: tournament.id,
                    teamId,
                    seed: data.format === "knockout" ? idx + 1 : undefined,
                })),
            });
            if (data.format === "league") {
                const fixtures = generateRoundRobinFixtures(data.teamIds, data.matchesPerPair ?? 1);
                await tx.tournamentFixture.createMany({
                    data: fixtures.map((f) => ({
                        tournamentId: tournament.id,
                        round: f.round,
                        homeTeamId: f.homeTeamId,
                        awayTeamId: f.awayTeamId,
                        status: "ready",
                    })),
                });
            }
            else {
                const totalRounds = Math.log2(data.teamIds.length);
                let previousRoundIds = [];
                for (let round = 1; round <= totalRounds; round++) {
                    const fixtureCount = round === 1 ? data.teamIds.length / 2 : previousRoundIds.length / 2;
                    const createdIds = [];
                    for (let i = 0; i < fixtureCount; i++) {
                        const created = await tx.tournamentFixture.create({
                            data: {
                                tournamentId: tournament.id,
                                round,
                                homeTeamId: round === 1 ? data.teamIds[i * 2] : null,
                                awayTeamId: round === 1 ? data.teamIds[i * 2 + 1] : null,
                                status: round === 1 ? "ready" : "pending",
                            },
                        });
                        createdIds.push(created.id);
                    }
                    if (round > 1) {
                        for (let i = 0; i < previousRoundIds.length; i++) {
                            await tx.tournamentFixture.update({
                                where: { id: previousRoundIds[i] },
                                data: { nextFixtureId: createdIds[Math.floor(i / 2)] },
                            });
                        }
                    }
                    previousRoundIds = createdIds;
                }
            }
            const full = await tx.tournament.findUnique({ where: { id: tournament.id }, include: tournamentInclude });
            return mapTournamentForClient(full);
        });
    }
    static async startTournament(userId, tournamentId) {
        const tournament = await index_1.prisma.tournament.findFirst({ where: { id: tournamentId, creatorId: userId } });
        if (!tournament) {
            throw new Error("Tournament not found or not owned by you");
        }
        if (tournament.status !== "draft") {
            throw new Error(`Cannot start a tournament that is '${tournament.status}'`);
        }
        const updated = await index_1.prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: "ongoing" },
            include: tournamentInclude,
        });
        return mapTournamentForClient(updated);
    }
    static async startFixtureMatch(userId, tournamentId, fixtureId, data) {
        const tournament = await index_1.prisma.tournament.findFirst({ where: { id: tournamentId, creatorId: userId } });
        if (!tournament) {
            throw new Error("Tournament not found or not owned by you");
        }
        const fixture = await index_1.prisma.tournamentFixture.findFirst({ where: { id: fixtureId, tournamentId } });
        if (!fixture) {
            throw new Error("Fixture not found");
        }
        if (fixture.status !== "ready") {
            throw new Error(`Cannot start a fixture that is '${fixture.status}'`);
        }
        if (!fixture.homeTeamId || !fixture.awayTeamId) {
            throw new Error("Fixture teams are not yet determined");
        }
        const match = await match_1.MatchService.createMatch(userId, {
            homeTeamId: fixture.homeTeamId,
            awayTeamId: fixture.awayTeamId,
            venueName: tournament.venueName ?? undefined,
            playersPerTeam: tournament.playersPerTeam,
            allowedSubs: tournament.allowedSubs,
            extraTimeAllowed: tournament.extraTimeAllowed,
            duration: data.duration,
            homeRoster: data.homeRoster,
            awayRoster: data.awayRoster,
            referees: data.referees,
        });
        await index_1.prisma.tournamentFixture.update({ where: { id: fixtureId }, data: { matchId: match.id } });
        const started = await match_1.MatchService.startMatch(userId, match.id);
        return started;
    }
    static async getTournamentById(id) {
        const tournament = await index_1.prisma.tournament.findUnique({ where: { id }, include: tournamentInclude });
        return tournament ? mapTournamentForClient(tournament) : null;
    }
    static async getMyTournaments(userId) {
        const tournaments = await index_1.prisma.tournament.findMany({
            where: { creatorId: userId },
            include: tournamentInclude,
            orderBy: { createdAt: "desc" },
        });
        return tournaments.map(mapTournamentForClient);
    }
    static async deleteTournament(userId, id) {
        const tournament = await index_1.prisma.tournament.findFirst({ where: { id, creatorId: userId } });
        if (!tournament) {
            throw new Error("Tournament not found or not owned by you");
        }
        if (tournament.status !== "draft") {
            throw new Error(`Cannot delete a tournament that is '${tournament.status}'`);
        }
        await index_1.prisma.tournament.delete({ where: { id } });
    }
}
exports.TournamentService = TournamentService;
//# sourceMappingURL=tournament.js.map