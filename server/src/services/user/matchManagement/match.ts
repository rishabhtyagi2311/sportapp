import { prisma as globalClient } from "../../../index";
import { withCache, invalidateCache } from "../../../utils/simpleCache";

const matchInclude = {
  homeTeam: { select: { id: true, name: true, location: true } },
  awayTeam: { select: { id: true, name: true, location: true } },
};

const MATCH_CACHE_TTL_MS = 2000;
const matchCacheKey = (matchId: string) => `match:${matchId}`;

function mapMatchForClient(match: any) {
  return {
    ...match,
    startedAt: match.startedAt?.toISOString?.() ?? match.startedAt ?? null,
    endedAt: match.endedAt?.toISOString?.() ?? match.endedAt ?? null,
    createdAt: match.createdAt?.toISOString?.() ?? match.createdAt,
    updatedAt: match.updatedAt?.toISOString?.() ?? match.updatedAt,
  };
}

function mapMatchEventForClient(event: any) {
  return {
    ...event,
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
  };
}

type Roster = { startingXI: number[]; bench: number[]; captainId: number; subsUsed: number };

/** Derives per-player match stats from a roster snapshot + the match's event
 *  timeline. Substitution events use `playerId` = player coming ON and
 *  `relatedPlayerId` = player going OFF; goal events use `relatedPlayerId`
 *  as the assist provider, when present. */
function computePlayerStats(
  homeRoster: Roster,
  awayRoster: Roster,
  homeTeamId: number,
  awayTeamId: number,
  events: any[],
  duration: number
) {
  const stats = new Map<
    number,
    { teamId: number; goals: number; assists: number; yellowCards: number; redCards: number; minutesPlayed: number; isStarter: boolean }
  >();

  const initPlayer = (playerId: number, teamId: number, isStarter: boolean) => {
    if (!stats.has(playerId)) {
      stats.set(playerId, { teamId, goals: 0, assists: 0, yellowCards: 0, redCards: 0, minutesPlayed: isStarter ? duration : 0, isStarter });
    }
  };

  homeRoster.startingXI.forEach((id) => initPlayer(id, homeTeamId, true));
  awayRoster.startingXI.forEach((id) => initPlayer(id, awayTeamId, true));
  homeRoster.bench.forEach((id) => initPlayer(id, homeTeamId, false));
  awayRoster.bench.forEach((id) => initPlayer(id, awayTeamId, false));

  for (const event of events) {
    if (event.eventType === "goal" && event.playerId) {
      const scorer = stats.get(event.playerId);
      if (scorer) scorer.goals += 1;
      if (event.relatedPlayerId) {
        const assister = stats.get(event.relatedPlayerId);
        if (assister) assister.assists += 1;
      }
    } else if (event.eventType === "yellow_card" && event.playerId) {
      const player = stats.get(event.playerId);
      if (player) player.yellowCards += 1;
    } else if (event.eventType === "red_card" && event.playerId) {
      const player = stats.get(event.playerId);
      if (player) player.redCards += 1;
    } else if (event.eventType === "substitution" && event.playerId) {
      const comingOn = stats.get(event.playerId);
      if (comingOn) {
        comingOn.isStarter = false;
        comingOn.minutesPlayed = duration - event.minute;
      }
      if (event.relatedPlayerId) {
        const goingOff = stats.get(event.relatedPlayerId);
        if (goingOff) goingOff.minutesPlayed = event.minute;
      }
    }
  }

  return Array.from(stats.entries()).map(([playerId, stat]) => ({ playerId, ...stat }));
}

/** Applies a completed tournament match's result to its fixture — league
 *  standings (played/won/drawn/lost/points/goals) or knockout bracket
 *  advancement (eliminate the loser, seed the winner into the next slot,
 *  and complete the tournament if this was the final). Runs inside the same
 *  transaction as the match-end update. */
async function applyFixtureResult(tx: any, fixture: any, match: any) {
  const tournament = fixture.tournament;

  if (tournament.format === "league") {
    const homeWon = match.homeScore > match.awayScore;
    const awayWon = match.awayScore > match.homeScore;
    const draw = match.homeScore === match.awayScore;

    await tx.tournamentEntry.updateMany({
      where: { tournamentId: tournament.id, teamId: match.homeTeamId },
      data: {
        played: { increment: 1 },
        won: { increment: homeWon ? 1 : 0 },
        drawn: { increment: draw ? 1 : 0 },
        lost: { increment: awayWon ? 1 : 0 },
        goalsFor: { increment: match.homeScore },
        goalsAgainst: { increment: match.awayScore },
        points: { increment: homeWon ? 3 : draw ? 1 : 0 },
      },
    });

    await tx.tournamentEntry.updateMany({
      where: { tournamentId: tournament.id, teamId: match.awayTeamId },
      data: {
        played: { increment: 1 },
        won: { increment: awayWon ? 1 : 0 },
        drawn: { increment: draw ? 1 : 0 },
        lost: { increment: homeWon ? 1 : 0 },
        goalsFor: { increment: match.awayScore },
        goalsAgainst: { increment: match.homeScore },
        points: { increment: awayWon ? 3 : draw ? 1 : 0 },
      },
    });

    await tx.tournamentFixture.update({ where: { id: fixture.id }, data: { status: "completed" } });

    const remaining = await tx.tournamentFixture.count({
      where: { tournamentId: tournament.id, status: { not: "completed" } },
    });
    if (remaining === 0) {
      await tx.tournament.update({ where: { id: tournament.id }, data: { status: "completed" } });
    }
  } else {
    // Knockout: a real winner is guaranteed here — endMatch rejects unresolved
    // ties before this ever runs.
    let winnerId: number;
    let loserId: number;
    if (match.homeScore !== match.awayScore) {
      winnerId = match.homeScore > match.awayScore ? match.homeTeamId : match.awayTeamId;
      loserId = match.homeScore > match.awayScore ? match.awayTeamId : match.homeTeamId;
    } else {
      winnerId = match.penaltyHomeScore > match.penaltyAwayScore ? match.homeTeamId : match.awayTeamId;
      loserId = match.penaltyHomeScore > match.penaltyAwayScore ? match.awayTeamId : match.homeTeamId;
    }

    await tx.tournamentEntry.updateMany({
      where: { tournamentId: tournament.id, teamId: loserId },
      data: { status: "eliminated" },
    });

    await tx.tournamentFixture.update({ where: { id: fixture.id }, data: { status: "completed" } });

    if (fixture.nextFixtureId) {
      const nextFixture = await tx.tournamentFixture.findUnique({ where: { id: fixture.nextFixtureId } });
      const slotField = nextFixture.homeTeamId === null ? "homeTeamId" : "awayTeamId";
      const updatedNext = await tx.tournamentFixture.update({
        where: { id: fixture.nextFixtureId },
        data: { [slotField]: winnerId },
      });
      if (updatedNext.homeTeamId && updatedNext.awayTeamId) {
        await tx.tournamentFixture.update({ where: { id: fixture.nextFixtureId }, data: { status: "ready" } });
      }
    } else {
      // No next fixture — this was the final.
      await tx.tournamentEntry.updateMany({
        where: { tournamentId: tournament.id, teamId: winnerId },
        data: { status: "winner" },
      });
      await tx.tournament.update({ where: { id: tournament.id }, data: { status: "completed" } });
    }
  }
}

/** Flushes the currently-accruing possession segment (if any) into the two
 *  banked totals, using a server wall-clock timestamp rather than any
 *  client-supplied elapsed-seconds value. `now` is injectable for tests.
 *  Returns the flushed totals only — callers decide what else to persist
 *  alongside them (new holder + fresh baseline, a paused/null baseline, or
 *  nothing further when finalizing a match). */
function accruePossession(match: { homeTeamId: number; currentPossessionTeamId: number | null; possessionStartedAt: Date | null; homePossessionSeconds: number; awayPossessionSeconds: number }, now: Date = new Date()) {
  let home = match.homePossessionSeconds;
  let away = match.awayPossessionSeconds;

  if (match.currentPossessionTeamId && match.possessionStartedAt) {
    const elapsed = Math.floor((now.getTime() - match.possessionStartedAt.getTime()) / 1000);
    if (elapsed > 0) {
      if (match.currentPossessionTeamId === match.homeTeamId) {
        home += elapsed;
      } else {
        away += elapsed;
      }
    }
  }

  return { home, away };
}

export class MatchService {
  static async createMatch(
    userId: number,
    data: {
      homeTeamId: number;
      awayTeamId: number;
      venueName?: string;
      playersPerTeam: number;
      allowedSubs: number;
      extraTimeAllowed: boolean;
      duration: number;
      homeRoster: Roster;
      awayRoster: Roster;
      referees: string[];
    }
  ) {
    const [homeTeam, awayTeam] = await Promise.all([
      globalClient.footballTeam.findUnique({ where: { id: data.homeTeamId } }),
      globalClient.footballTeam.findUnique({ where: { id: data.awayTeamId } }),
    ]);

    if (!homeTeam || !awayTeam) {
      throw new Error("One or both teams could not be found");
    }

    const match = await globalClient.match.create({
      data: {
        creatorId: userId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        venueName: data.venueName,
        playersPerTeam: data.playersPerTeam,
        allowedSubs: data.allowedSubs,
        extraTimeAllowed: data.extraTimeAllowed,
        duration: data.duration,
        homeRoster: data.homeRoster,
        awayRoster: data.awayRoster,
        referees: data.referees,
      },
      include: matchInclude,
    });

    return mapMatchForClient(match);
  }

  static async scheduleMatch(
    userId: number,
    data: { homeTeamId: number; awayTeamId: number; scheduledAt: string; venueName?: string }
  ) {
    const [homeTeam, awayTeam] = await Promise.all([
      globalClient.footballTeam.findUnique({ where: { id: data.homeTeamId } }),
      globalClient.footballTeam.findUnique({ where: { id: data.awayTeamId } }),
    ]);

    if (!homeTeam || !awayTeam) {
      throw new Error("One or both teams could not be found");
    }

    const match = await globalClient.match.create({
      data: {
        creatorId: userId,
        homeTeamId: data.homeTeamId,
        awayTeamId: data.awayTeamId,
        venueName: data.venueName,
        scheduledAt: new Date(data.scheduledAt),
        referees: [],
      },
      include: matchInclude,
    });

    return mapMatchForClient(match);
  }

  static async startMatch(
    userId: number,
    matchId: string,
    data?: {
      playersPerTeam?: number;
      allowedSubs?: number;
      extraTimeAllowed?: boolean;
      duration?: number;
      homeRoster?: Roster;
      awayRoster?: Roster;
      referees?: string[];
    }
  ) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "scheduled") {
      throw new Error(`Cannot start a match that is '${match.status}'`);
    }

    // A match created via `scheduleMatch` has no lineup/settings yet — the
    // organizer must supply them now, at kickoff. A match created via the
    // original all-at-once `createMatch` already has them, so `data` (if
    // any) is ignored and the match starts exactly as it always has.
    let finalizeData = {};
    if (!match.homeRoster || !match.awayRoster || match.playersPerTeam == null || match.allowedSubs == null || match.duration == null) {
      if (!data || data.playersPerTeam == null || data.allowedSubs == null || data.duration == null || !data.homeRoster || !data.awayRoster) {
        throw new Error("This match needs its lineup and settings before it can start");
      }
      finalizeData = {
        playersPerTeam: data.playersPerTeam,
        allowedSubs: data.allowedSubs,
        extraTimeAllowed: data.extraTimeAllowed ?? false,
        duration: data.duration,
        homeRoster: data.homeRoster,
        awayRoster: data.awayRoster,
        referees: data.referees ?? [],
      };
    }

    const updated = await globalClient.match.update({
      where: { id: matchId },
      data: { status: "live", startedAt: new Date(), ...finalizeData },
      include: matchInclude,
    });

    invalidateCache(matchCacheKey(matchId));
    return mapMatchForClient(updated);
  }

  static async abandonMatch(userId: number, matchId: string, reason?: string) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status === "completed" || match.status === "abandoned") {
      throw new Error(`Cannot abandon a match that is already '${match.status}'`);
    }

    const { home: finalHomePossession, away: finalAwayPossession } = accruePossession(match);

    const updated = await globalClient.match.update({
      where: { id: matchId },
      data: {
        status: "abandoned",
        endedAt: new Date(),
        notes: reason,
        homePossessionSeconds: finalHomePossession,
        awayPossessionSeconds: finalAwayPossession,
        possessionStartedAt: null,
      },
      include: matchInclude,
    });

    invalidateCache(matchCacheKey(matchId));
    return mapMatchForClient(updated);
  }

  static async addEvent(
    userId: number,
    matchId: string,
    data: {
      teamId: number;
      playerId?: number;
      relatedPlayerId?: number;
      eventType: string;
      eventSubType?: string;
      minute: number;
      seconds: number;
      notes?: string;
    }
  ) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "live") {
      throw new Error(`Cannot add events to a match that is '${match.status}'`);
    }

    const event = await globalClient.$transaction(async (tx) => {
      const created = await tx.matchEvent.create({ data: { matchId, ...data } });

      if (data.eventType === "goal") {
        const scoringField = data.teamId === match.homeTeamId ? "homeScore" : "awayScore";
        await tx.match.update({ where: { id: matchId }, data: { [scoringField]: { increment: 1 } } });
      } else if (data.eventType === "own_goal") {
        const scoringField = data.teamId === match.homeTeamId ? "awayScore" : "homeScore";
        await tx.match.update({ where: { id: matchId }, data: { [scoringField]: { increment: 1 } } });
      }

      return mapMatchEventForClient(created);
    });

    invalidateCache(matchCacheKey(matchId));
    return event;
  }

  static async updatePossession(userId: number, matchId: string, data: { teamId: number }) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "live") {
      throw new Error(`Cannot update possession on a match that is '${match.status}'`);
    }

    if (data.teamId !== match.homeTeamId && data.teamId !== match.awayTeamId) {
      throw new Error("teamId must be one of the match's two teams");
    }

    const now = new Date();
    const { home, away } = accruePossession(match, now);

    const updated = await globalClient.match.update({
      where: { id: matchId },
      data: {
        homePossessionSeconds: home,
        awayPossessionSeconds: away,
        currentPossessionTeamId: data.teamId,
        possessionStartedAt: now,
      },
      include: matchInclude,
    });

    invalidateCache(matchCacheKey(matchId));
    return mapMatchForClient(updated);
  }

  static async pausePossession(userId: number, matchId: string) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "live") {
      throw new Error(`Cannot pause possession on a match that is '${match.status}'`);
    }

    if (!match.currentPossessionTeamId || !match.possessionStartedAt) {
      const current = await globalClient.match.findUnique({ where: { id: matchId }, include: matchInclude });
      return mapMatchForClient(current);
    }

    const { home, away } = accruePossession(match);

    const updated = await globalClient.match.update({
      where: { id: matchId },
      data: {
        homePossessionSeconds: home,
        awayPossessionSeconds: away,
        possessionStartedAt: null,
      },
      include: matchInclude,
    });

    invalidateCache(matchCacheKey(matchId));
    return mapMatchForClient(updated);
  }

  static async resumePossession(userId: number, matchId: string) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "live") {
      throw new Error(`Cannot resume possession on a match that is '${match.status}'`);
    }

    if (!match.currentPossessionTeamId) {
      const current = await globalClient.match.findUnique({ where: { id: matchId }, include: matchInclude });
      return mapMatchForClient(current);
    }

    const updated = await globalClient.match.update({
      where: { id: matchId },
      data: { possessionStartedAt: new Date() },
      include: matchInclude,
    });

    invalidateCache(matchCacheKey(matchId));
    return mapMatchForClient(updated);
  }

  static async endMatch(userId: number, matchId: string, data: { penaltyHomeScore?: number; penaltyAwayScore?: number; notes?: string }) {
    const match = await globalClient.match.findFirst({ where: { id: matchId, creatorId: userId } });

    if (!match) {
      throw new Error("Match not found or not owned by you");
    }

    if (match.status !== "live") {
      throw new Error(`Cannot end a match that is '${match.status}'`);
    }

    const fixture = await globalClient.tournamentFixture.findUnique({
      where: { matchId },
      include: { tournament: true },
    });

    if (
      fixture &&
      fixture.tournament.format === "knockout" &&
      match.homeScore === match.awayScore &&
      (data.penaltyHomeScore === undefined || data.penaltyAwayScore === undefined || data.penaltyHomeScore === data.penaltyAwayScore)
    ) {
      throw new Error("This knockout match is tied — penalty scores are required to determine a winner");
    }

    // Fetched and computed outside the transaction — this is a read plus
    // pure CPU-bound JS work (iterates every event and both full rosters),
    // and neither needs transactional consistency with the writes below.
    // Doing it before the transaction opens keeps the held DB connection
    // limited to just the writes, instead of blocking the event loop while
    // a pooled connection sits open underneath it.
    const events = await globalClient.matchEvent.findMany({ where: { matchId } });
    const homeRoster = match.homeRoster as unknown as Roster;
    const awayRoster = match.awayRoster as unknown as Roster;
    // A 'live' match always has `duration` set — either from `createMatch`
    // directly, or filled in by `startMatch`'s finalize step for a
    // previously-scheduled match — so this is safe to assert non-null.
    const playerStats = computePlayerStats(homeRoster, awayRoster, match.homeTeamId, match.awayTeamId, events, match.duration!);

    return globalClient.$transaction(async (tx) => {
      if (playerStats.length > 0) {
        await tx.matchPlayerStat.createMany({
          data: playerStats.map((s) => ({
            matchId,
            playerId: s.playerId,
            teamId: s.teamId,
            goals: s.goals,
            assists: s.assists,
            yellowCards: s.yellowCards,
            redCards: s.redCards,
            minutesPlayed: s.minutesPlayed,
            isStarter: s.isStarter,
          })),
        });
      }

      const homeResult = match.homeScore > match.awayScore ? "win" : match.homeScore < match.awayScore ? "loss" : "draw";

      await tx.footballTeam.update({
        where: { id: match.homeTeamId },
        data: {
          matchesPlayed: { increment: 1 },
          matchesWon: { increment: homeResult === "win" ? 1 : 0 },
          matchesLost: { increment: homeResult === "loss" ? 1 : 0 },
          matchesDrawn: { increment: homeResult === "draw" ? 1 : 0 },
        },
      });

      await tx.footballTeam.update({
        where: { id: match.awayTeamId },
        data: {
          matchesPlayed: { increment: 1 },
          matchesWon: { increment: homeResult === "loss" ? 1 : 0 },
          matchesLost: { increment: homeResult === "win" ? 1 : 0 },
          matchesDrawn: { increment: homeResult === "draw" ? 1 : 0 },
        },
      });

      const { home: finalHomePossession, away: finalAwayPossession } = accruePossession(match);

      const updated = await tx.match.update({
        where: { id: matchId },
        data: {
          status: "completed",
          endedAt: new Date(),
          penaltyHomeScore: data.penaltyHomeScore,
          penaltyAwayScore: data.penaltyAwayScore,
          notes: data.notes,
          homePossessionSeconds: finalHomePossession,
          awayPossessionSeconds: finalAwayPossession,
          possessionStartedAt: null,
        },
        include: matchInclude,
      });

      if (fixture) {
        await applyFixtureResult(tx, fixture, updated);
      }

      return mapMatchForClient(updated);
    }).then((result) => {
      invalidateCache(matchCacheKey(matchId));
      return result;
    });
  }

  static async getMatchById(id: string) {
    // Polled every 5s by every live-match viewer, unauthenticated, with an
    // individually cheap query — the short cache absorbs repeated identical
    // polls across viewers of the same match rather than hitting Postgres
    // for each one. Invalidated immediately by every mutating call below,
    // so a viewer's own action is never masked by stale cache — only other
    // viewers' polls within the 2s window ever see a cached response.
    return withCache(matchCacheKey(id), MATCH_CACHE_TTL_MS, async () => {
      const match = await globalClient.match.findUnique({
        where: { id },
        include: { ...matchInclude, events: { orderBy: { minute: "asc" } }, stats: true },
      });

      if (!match) return null;

      return {
        ...mapMatchForClient(match),
        events: match.events.map(mapMatchEventForClient),
      };
    });
  }

  static async getMyMatches(userId: number) {
    const profile = await globalClient.footballProfile.findUnique({ where: { userId }, select: { id: true } });

    const ownedTeamIds = profile
      ? (
          await globalClient.footballTeam.findMany({
            where: { OR: [{ createdById: profile.id }, { members: { some: { footballProfileId: profile.id } } }] },
            select: { id: true },
          })
        ).map((t) => t.id)
      : [];

    const matches = await globalClient.match.findMany({
      where: {
        OR: [{ creatorId: userId }, { homeTeamId: { in: ownedTeamIds } }, { awayTeamId: { in: ownedTeamIds } }],
      },
      include: matchInclude,
      orderBy: { createdAt: "desc" },
    });

    return matches.map(mapMatchForClient);
  }

  static async getTeamMatches(teamId: number) {
    const matches = await globalClient.match.findMany({
      where: { OR: [{ homeTeamId: teamId }, { awayTeamId: teamId }], status: "completed" },
      include: matchInclude,
      orderBy: { endedAt: "desc" },
    });

    return matches.map(mapMatchForClient);
  }

  static async getPlayerStats(profileId: number) {
    const aggregate = await globalClient.matchPlayerStat.aggregate({
      where: { playerId: profileId },
      _sum: { goals: true, assists: true, yellowCards: true, redCards: true, minutesPlayed: true },
      _count: { _all: true },
    });

    return {
      matchesPlayed: aggregate._count._all,
      goals: aggregate._sum.goals ?? 0,
      assists: aggregate._sum.assists ?? 0,
      yellowCards: aggregate._sum.yellowCards ?? 0,
      redCards: aggregate._sum.redCards ?? 0,
      minutesPlayed: aggregate._sum.minutesPlayed ?? 0,
    };
  }
}
