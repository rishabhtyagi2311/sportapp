import { prisma as globalClient } from "../../../index";

export function mapEventForClient(event: any) {
  const { venue, ...rest } = event;
  return {
    ...rest,
    dateTime: event.dateTime?.toISOString?.() ?? event.dateTime,
    registrationDeadline: event.registrationDeadline?.toISOString?.() ?? event.registrationDeadline,
    createdAt: event.createdAt?.toISOString?.() ?? event.createdAt,
    updatedAt: event.updatedAt?.toISOString?.() ?? event.updatedAt,
    ...(venue ? { venueName: venue.name } : {}),
  };
}

const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  upcoming: ["ongoing", "cancelled"],
  ongoing: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

export class EventService {
  static async createEvent(userId: number, data: any) {
    const organizer = await globalClient.userInfo.findUnique({ where: { id: userId } });

    if (!organizer) {
      throw new Error("User not found");
    }

    const event = await globalClient.event.create({
      data: {
        creatorId: userId,
        venueId: data.venueId,
        locationName: data.locationName,
        name: data.name,
        description: data.description,
        eventType: data.eventType,
        tournamentFormat: data.tournamentFormat,
        sportName: data.sportName,
        participationType: data.participationType,
        teamSize: data.teamSize,
        maxParticipants: data.maxParticipants,
        dateTime: new Date(data.dateTime),
        duration: data.duration,
        feeAmount: data.feeAmount,
        feeCurrency: data.feeCurrency || "INR",
        feeType: data.feeType,
        organizerName: `${organizer.firstname} ${organizer.lastname}`,
        organizerContact: organizer.contact,
        isPublic: data.isPublic ?? true,
        registrationDeadline: new Date(data.registrationDeadline),
      },
      include: { venue: { select: { name: true } } },
    });

    return mapEventForClient(event);
  }

  static async getMyEvents(userId: number) {
    const events = await globalClient.event.findMany({
      where: { creatorId: userId },
      include: { venue: { select: { name: true } } },
      orderBy: { dateTime: "desc" },
    });

    return events.map(mapEventForClient);
  }

  static async getPublicEvents(filters: { sportName?: string; city?: string; eventType?: string; status?: string } = {}) {
    const events = await globalClient.event.findMany({
      where: {
        isPublic: true,
        status: filters.status ? filters.status : { not: "cancelled" },
        ...(filters.sportName ? { sportName: { equals: filters.sportName, mode: "insensitive" } } : {}),
        ...(filters.eventType ? { eventType: filters.eventType } : {}),
        ...(filters.city ? { venue: { city: { equals: filters.city, mode: "insensitive" } } } : {}),
      },
      include: { venue: { select: { name: true } } },
      orderBy: { dateTime: "asc" },
    });

    return events.map(mapEventForClient);
  }

  static async getEventById(eventId: string) {
    const event = await globalClient.event.findUnique({
      where: { id: eventId },
      include: { venue: { select: { name: true } } },
    });

    return event ? mapEventForClient(event) : null;
  }

  static async updateEvent(userId: number, eventId: string, data: any) {
    const existing = await globalClient.event.findFirst({ where: { id: eventId, creatorId: userId } });

    if (!existing) {
      throw new Error("Event not found or not owned by you");
    }

    if (data.status && data.status !== existing.status) {
      const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status] ?? [];
      if (!allowed.includes(data.status)) {
        throw new Error(`Cannot change event status from '${existing.status}' to '${data.status}'`);
      }
    }

    const event = await globalClient.event.update({
      where: { id: eventId },
      data: {
        venueId: data.venueId,
        locationName: data.locationName,
        name: data.name,
        description: data.description,
        sportName: data.sportName,
        teamSize: data.teamSize,
        maxParticipants: data.maxParticipants,
        dateTime: data.dateTime ? new Date(data.dateTime) : undefined,
        duration: data.duration,
        feeAmount: data.feeAmount,
        feeType: data.feeType,
        isPublic: data.isPublic,
        registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : undefined,
        status: data.status,
      },
      include: { venue: { select: { name: true } } },
    });

    return mapEventForClient(event);
  }

  static async deleteEvent(userId: number, eventId: string) {
    const existing = await globalClient.event.findFirst({ where: { id: eventId, creatorId: userId } });

    if (!existing) {
      throw new Error("Event not found or not owned by you");
    }

    await globalClient.event.delete({ where: { id: eventId } });
  }
}
