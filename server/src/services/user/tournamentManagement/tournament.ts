import { randomUUID } from "crypto";
import { prisma as globalClient } from "../../../index";
import { MatchService } from "../matchManagement/match";

const tournamentInclude = {
  entries: { include: { team: { select: { id: true, name: true, location: true } } } },
  fixtures: {
    include: {
      homeTeam: { select: { id: true, name: true } },
      awayTeam: { select: { id: true, name: true } },
    },
  },
};

function mapTournamentForClient(tournament: any) {
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
function generateRoundRobinFixtures(teamIds: number[], matchesPerPair: number) {
  const teams = [...teamIds];
  const hasBye = teams.length % 2 !== 0;
  if (hasBye) teams.push(-1);

  const n = teams.length;
  const roundsPerCycle = n - 1;
  const half = n / 2;
  const fixtures: { round: number; homeTeamId: number; awayTeamId: number }[] = [];

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
    rest.unshift(rest.pop()!);
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

export class TournamentService {
  static async createTournament(
    userId: number,
    data: {
      name: string;
      description?: string;
      format: "league" | "knockout";
      teamIds: number[];
      matchesPerPair?: number;
      extraTimeAllowed: boolean;
      playersPerTeam: number;
      allowedSubs: number;
      venueName?: string;
    }
  ) {
    const teams = await globalClient.footballTeam.findMany({ where: { id: { in: data.teamIds } } });

    if (teams.length !== data.teamIds.length) {
      throw new Error("One or more teams could not be found");
    }

    return globalClient.$transaction(async (tx) => {
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
      } else {
        // Pre-generate every fixture's id up front (Node's built-in
        // crypto.randomUUID — no need for a new dependency) so each round's
        // nextFixtureId can be set directly while building the array,
        // instead of creating fixtures one at a time and reading their ids
        // back to wire up the bracket with individual update calls.
        const totalRounds = Math.log2(data.teamIds.length);
        const allFixtures: {
          id: string;
          tournamentId: string;
          round: number;
          homeTeamId: number | null;
          awayTeamId: number | null;
          status: string;
          nextFixtureId: string | null;
        }[] = [];
        let previousRoundIds: string[] = [];

        for (let round = 1; round <= totalRounds; round++) {
          const fixtureCount = round === 1 ? data.teamIds.length / 2 : previousRoundIds.length / 2;
          const roundIds = Array.from({ length: fixtureCount }, () => randomUUID());

          if (round > 1) {
            previousRoundIds.forEach((id, i) => {
              const fixture = allFixtures.find((f) => f.id === id)!;
              fixture.nextFixtureId = roundIds[Math.floor(i / 2)];
            });
          }

          roundIds.forEach((id, i) => {
            allFixtures.push({
              id,
              tournamentId: tournament.id,
              round,
              homeTeamId: round === 1 ? data.teamIds[i * 2] : null,
              awayTeamId: round === 1 ? data.teamIds[i * 2 + 1] : null,
              status: round === 1 ? "ready" : "pending",
              nextFixtureId: null,
            });
          });

          previousRoundIds = roundIds;
        }

        await tx.tournamentFixture.createMany({ data: allFixtures });
      }

      const full = await tx.tournament.findUnique({ where: { id: tournament.id }, include: tournamentInclude });
      return mapTournamentForClient(full);
    });
  }

  static async startTournament(userId: number, tournamentId: string) {
    const tournament = await globalClient.tournament.findFirst({ where: { id: tournamentId, creatorId: userId } });

    if (!tournament) {
      throw new Error("Tournament not found or not owned by you");
    }

    if (tournament.status !== "draft") {
      throw new Error(`Cannot start a tournament that is '${tournament.status}'`);
    }

    const updated = await globalClient.tournament.update({
      where: { id: tournamentId },
      data: { status: "ongoing" },
      include: tournamentInclude,
    });

    return mapTournamentForClient(updated);
  }

  static async startFixtureMatch(
    userId: number,
    tournamentId: string,
    fixtureId: string,
    data: { duration: number; homeRoster: any; awayRoster: any; referees: string[] }
  ) {
    const tournament = await globalClient.tournament.findFirst({ where: { id: tournamentId, creatorId: userId } });

    if (!tournament) {
      throw new Error("Tournament not found or not owned by you");
    }

    const fixture = await globalClient.tournamentFixture.findFirst({ where: { id: fixtureId, tournamentId } });

    if (!fixture) {
      throw new Error("Fixture not found");
    }

    if (fixture.status !== "ready") {
      throw new Error(`Cannot start a fixture that is '${fixture.status}'`);
    }

    if (!fixture.homeTeamId || !fixture.awayTeamId) {
      throw new Error("Fixture teams are not yet determined");
    }

    const match = await MatchService.createMatch(userId, {
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

    await globalClient.tournamentFixture.update({ where: { id: fixtureId }, data: { matchId: match.id } });
    const started = await MatchService.startMatch(userId, match.id);

    return started;
  }

  static async setFixtureSchedule(
    userId: number,
    tournamentId: string,
    fixtureId: string,
    data: { scheduledAt: string; venueName?: string }
  ) {
    const tournament = await globalClient.tournament.findFirst({ where: { id: tournamentId, creatorId: userId } });

    if (!tournament) {
      throw new Error("Tournament not found or not owned by you");
    }

    const fixture = await globalClient.tournamentFixture.findFirst({ where: { id: fixtureId, tournamentId } });

    if (!fixture) {
      throw new Error("Fixture not found");
    }

    if (fixture.status === "completed" || fixture.matchId) {
      throw new Error("Cannot set a schedule for a fixture whose match has already started or finished");
    }

    const updated = await globalClient.tournament.update({
      where: { id: tournamentId },
      data: {
        fixtures: {
          update: {
            where: { id: fixtureId },
            data: { scheduledAt: new Date(data.scheduledAt), venueName: data.venueName },
          },
        },
      },
      include: tournamentInclude,
    });

    return mapTournamentForClient(updated);
  }

  static async getTournamentById(id: string) {
    const tournament = await globalClient.tournament.findUnique({ where: { id }, include: tournamentInclude });

    return tournament ? mapTournamentForClient(tournament) : null;
  }

  static async getMyTournaments(userId: number) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId }, select: { id: true } });

    const ownedTeamIds = profile
      ? (
          await globalClient.footballTeam.findMany({
            where: { OR: [{ createdById: profile.id }, { members: { some: { footballProfileId: profile.id } } }] },
            select: { id: true },
          })
        ).map((t) => t.id)
      : [];

    const tournaments = await globalClient.tournament.findMany({
      where: { OR: [{ creatorId: userId }, { entries: { some: { teamId: { in: ownedTeamIds } } } }] },
      include: tournamentInclude,
      orderBy: { createdAt: "desc" },
    });

    return tournaments.map(mapTournamentForClient);
  }

  static async deleteTournament(userId: number, id: string) {
    const tournament = await globalClient.tournament.findFirst({ where: { id, creatorId: userId } });

    if (!tournament) {
      throw new Error("Tournament not found or not owned by you");
    }

    if (tournament.status !== "draft") {
      throw new Error(`Cannot delete a tournament that is '${tournament.status}'`);
    }

    await globalClient.tournament.delete({ where: { id } });
  }
}
