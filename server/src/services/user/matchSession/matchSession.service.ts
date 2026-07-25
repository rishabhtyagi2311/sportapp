import { prisma as globalClient } from "../../../index";

function mapMatchSessionForClient(session: any) {
  const { venue, ...rest } = session;
  return {
    ...rest,
    date: session.date.toISOString().split("T")[0],
    ...(venue ? { venueName: venue.name } : {}),
  };
}

export class UserMatchSessionService {
  static async listAvailable(filters: { venueId?: string; date?: string } = {}) {
    const where: any = {
      status: { in: ["pending", "live"] },
      venue: { isActive: true },
    };

    if (filters.venueId) {
      where.venueId = filters.venueId;
    }

    if (filters.date) {
      where.date = new Date(filters.date);
    }

    const sessions = await globalClient.matchSession.findMany({
      where,
      include: { venue: { select: { name: true } } },
      orderBy: { date: "asc" },
    });

    return sessions.map(mapMatchSessionForClient);
  }

  static async getById(sessionId: string) {
    const session = await globalClient.matchSession.findUnique({
      where: { id: sessionId },
      include: { venue: { select: { name: true } } },
    });

    if (!session) {
      throw new Error("Match session not found");
    }

    return mapMatchSessionForClient(session);
  }

  static async getMySessions(userId: number) {
    const participations = await globalClient.matchSessionParticipant.findMany({
      where: { userId, status: "joined" },
      include: { matchSession: { include: { venue: { select: { name: true } } } } },
      orderBy: { joinedAt: "desc" },
    });

    return participations.map((p) => mapMatchSessionForClient(p.matchSession));
  }

  static async joinSession(userId: number, sessionId: string) {
    return globalClient.$transaction(async (tx) => {
      const session = await tx.matchSession.findUnique({ where: { id: sessionId } });

      if (!session) {
        throw new Error("Match session not found");
      }

      if (session.status !== "pending" && session.status !== "live") {
        throw new Error(`Cannot join a '${session.status}' match session`);
      }

      if (session.playersJoined >= session.totalPlayers) {
        throw new Error("This match session is already full");
      }

      const existing = await tx.matchSessionParticipant.findUnique({
        where: { matchSessionId_userId: { matchSessionId: sessionId, userId } },
      });

      if (existing && existing.status === "joined") {
        throw new Error("You have already joined this match session");
      }

      if (existing) {
        await tx.matchSessionParticipant.update({
          where: { id: existing.id },
          data: { status: "joined", joinedAt: new Date() },
        });
      } else {
        await tx.matchSessionParticipant.create({
          data: { matchSessionId: sessionId, userId, status: "joined" },
        });
      }

      const updated = await tx.matchSession.update({
        where: { id: sessionId },
        data: { playersJoined: { increment: 1 } },
      });

      return mapMatchSessionForClient(updated);
    });
  }

  static async leaveSession(userId: number, sessionId: string) {
    return globalClient.$transaction(async (tx) => {
      const session = await tx.matchSession.findUnique({ where: { id: sessionId } });

      if (!session) {
        throw new Error("Match session not found");
      }

      if (session.status !== "pending") {
        throw new Error(`Cannot leave a '${session.status}' match session`);
      }

      const participant = await tx.matchSessionParticipant.findUnique({
        where: { matchSessionId_userId: { matchSessionId: sessionId, userId } },
      });

      if (!participant || participant.status !== "joined") {
        throw new Error("You have not joined this match session");
      }

      await tx.matchSessionParticipant.update({
        where: { id: participant.id },
        data: { status: "left" },
      });

      const updated = await tx.matchSession.update({
        where: { id: sessionId },
        data: { playersJoined: { decrement: 1 } },
      });

      return mapMatchSessionForClient(updated);
    });
  }
}
