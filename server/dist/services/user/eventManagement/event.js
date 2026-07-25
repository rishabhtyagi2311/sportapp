"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
exports.mapEventForClient = mapEventForClient;
const index_1 = require("../../../index");
function mapEventForClient(event) {
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
const ALLOWED_STATUS_TRANSITIONS = {
    upcoming: ["ongoing", "cancelled"],
    ongoing: ["completed", "cancelled"],
    completed: [],
    cancelled: [],
};
class EventService {
    static async createEvent(userId, data) {
        const organizer = await index_1.prisma.userInfo.findUnique({ where: { id: userId } });
        if (!organizer) {
            throw new Error("User not found");
        }
        const event = await index_1.prisma.event.create({
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
    static async getMyEvents(userId) {
        const events = await index_1.prisma.event.findMany({
            where: { creatorId: userId },
            include: { venue: { select: { name: true } } },
            orderBy: { dateTime: "desc" },
        });
        return events.map(mapEventForClient);
    }
    static async getPublicEvents(filters = {}) {
        const events = await index_1.prisma.event.findMany({
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
    static async getEventById(eventId) {
        const event = await index_1.prisma.event.findUnique({
            where: { id: eventId },
            include: { venue: { select: { name: true } } },
        });
        return event ? mapEventForClient(event) : null;
    }
    static async updateEvent(userId, eventId, data) {
        const existing = await index_1.prisma.event.findFirst({ where: { id: eventId, creatorId: userId } });
        if (!existing) {
            throw new Error("Event not found or not owned by you");
        }
        if (data.status && data.status !== existing.status) {
            const allowed = ALLOWED_STATUS_TRANSITIONS[existing.status] ?? [];
            if (!allowed.includes(data.status)) {
                throw new Error(`Cannot change event status from '${existing.status}' to '${data.status}'`);
            }
        }
        const event = await index_1.prisma.event.update({
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
    static async deleteEvent(userId, eventId) {
        const existing = await index_1.prisma.event.findFirst({ where: { id: eventId, creatorId: userId } });
        if (!existing) {
            throw new Error("Event not found or not owned by you");
        }
        await index_1.prisma.event.delete({ where: { id: eventId } });
    }
}
exports.EventService = EventService;
//# sourceMappingURL=event.js.map