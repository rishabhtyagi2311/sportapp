import { prisma as globalClient } from "../../../index";
import { mapEventForClient } from "./event";

function mapRegistrationForClient(registration: any) {
  const { footballTeam, user, event, ...rest } = registration;
  return {
    ...rest,
    createdAt: registration.createdAt?.toISOString?.() ?? registration.createdAt,
    processedAt: registration.processedAt?.toISOString?.() ?? registration.processedAt ?? null,
    ...(footballTeam ? { teamName: footballTeam.name } : {}),
    ...(user ? { registrantName: `${user.firstname} ${user.lastname}` } : {}),
    ...(event ? { event: mapEventForClient(event) } : {}),
  };
}

export class EventRegistrationService {
  static async createRegistration(
    userId: number,
    eventId: string,
    data: { participationType: "individual" | "team"; footballTeamId?: number }
  ) {
    const event = await globalClient.event.findUnique({ where: { id: eventId } });

    if (!event) {
      throw new Error("Event not found");
    }

    if (event.status !== "upcoming") {
      throw new Error(`Cannot register for an event that is '${event.status}'`);
    }

    if (new Date(event.registrationDeadline) < new Date()) {
      throw new Error("Registration deadline has passed");
    }

    try {
      if (data.participationType === "individual") {
        const registration = await globalClient.eventRegistration.create({
          data: { eventId, userId, status: "pending" },
          include: { user: true },
        });

        return mapRegistrationForClient(registration);
      }

      const footballProfile = await globalClient.footballProfile.findUnique({ where: { userId } });

      if (!footballProfile) {
        throw new Error("You need a football profile to register a team");
      }

      const team = await globalClient.footballTeam.findUnique({ where: { id: data.footballTeamId! } });

      if (!team) {
        throw new Error("Football team not found");
      }

      if (team.createdById !== footballProfile.id) {
        throw new Error("Only the team's captain can register it for an event");
      }

      const registration = await globalClient.eventRegistration.create({
        data: { eventId, footballTeamId: data.footballTeamId, status: "pending" },
        include: { footballTeam: true },
      });

      return mapRegistrationForClient(registration);
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new Error("You have already registered for this event");
      }
      throw error;
    }
  }

  static async getMyRegistrations(userId: number) {
    const footballProfile = await globalClient.footballProfile.findUnique({ where: { userId } });

    const registrations = await globalClient.eventRegistration.findMany({
      where: {
        OR: [
          { userId },
          ...(footballProfile ? [{ footballTeam: { createdById: footballProfile.id } }] : []),
        ],
      },
      include: {
        event: { include: { venue: { select: { name: true } } } },
        footballTeam: true,
        user: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return registrations.map(mapRegistrationForClient);
  }

  static async getRegistrationsForEvent(userId: number, eventId: string) {
    const event = await globalClient.event.findFirst({ where: { id: eventId, creatorId: userId } });

    if (!event) {
      throw new Error("Event not found or not owned by you");
    }

    const registrations = await globalClient.eventRegistration.findMany({
      where: { eventId },
      include: { footballTeam: true, user: true },
      orderBy: { createdAt: "asc" },
    });

    return registrations.map(mapRegistrationForClient);
  }

  static async processRegistration(
    userId: number,
    eventId: string,
    registrationId: string,
    data: { status: "accepted" | "rejected"; notes?: string }
  ) {
    const event = await globalClient.event.findFirst({ where: { id: eventId, creatorId: userId } });

    if (!event) {
      throw new Error("Event not found or not owned by you");
    }

    return globalClient.$transaction(async (tx) => {
      const registration = await tx.eventRegistration.findFirst({ where: { id: registrationId, eventId } });

      if (!registration) {
        throw new Error("Registration not found");
      }

      if (registration.status !== "pending") {
        throw new Error(`Cannot process a registration that is already '${registration.status}'`);
      }

      if (data.status === "accepted") {
        const currentEvent = await tx.event.findUnique({ where: { id: eventId } });

        if (!currentEvent || currentEvent.currentParticipants >= currentEvent.maxParticipants) {
          throw new Error("Event is already full");
        }

        await tx.event.update({
          where: { id: eventId },
          data: { currentParticipants: { increment: 1 } },
        });
      }

      const updated = await tx.eventRegistration.update({
        where: { id: registrationId },
        data: {
          status: data.status,
          notes: data.notes,
          processedAt: new Date(),
          processedBy: userId,
        },
        include: { footballTeam: true, user: true },
      });

      return mapRegistrationForClient(updated);
    });
  }
}
