"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlotService = void 0;
const index_1 = require("../../../index");
const slotGenerator_1 = require("./slotGenerator");
const MANUALLY_SETTABLE_STATUSES = ['available', 'blocked'];
function mapMatchSessionForClient(session) {
    return {
        ...session,
        date: session.date.toISOString().split('T')[0],
    };
}
class SlotService {
    static async getSlotsForVenue(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const where = { venueId: params.venueId };
        if (params.date) {
            where.date = new Date(params.date);
        }
        if (params.startDate && params.endDate) {
            where.date = { gte: new Date(params.startDate), lte: new Date(params.endDate) };
        }
        if (params.varietyId) {
            where.varietyId = params.varietyId;
        }
        if (params.status) {
            where.status = params.status;
        }
        const slots = await index_1.prisma.timeSlot.findMany({
            where,
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
        const blockedSlotIds = slots.filter((s) => s.status === 'blocked').map((s) => s.id);
        if (blockedSlotIds.length === 0) {
            return slots;
        }
        const blocks = await index_1.prisma.slotBlock.findMany({
            where: { slotId: { in: blockedSlotIds } },
            orderBy: { createdAt: 'desc' },
        });
        const blockBySlotId = new Map();
        for (const block of blocks) {
            if (!blockBySlotId.has(block.slotId)) {
                blockBySlotId.set(block.slotId, { id: block.id, reason: block.reason });
            }
        }
        return slots.map((slot) => {
            const activeBlock = blockBySlotId.get(slot.id);
            return {
                ...slot,
                ...(activeBlock ? { blockId: activeBlock.id, blockReason: activeBlock.reason } : {}),
            };
        });
    }
    /** Public, unauthenticated slot lookup — visible only for active venues. */
    static async getPublicSlotsForVenue(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, isActive: true } });
        if (!venue) {
            throw new Error('Venue not found');
        }
        const where = { venueId: params.venueId };
        if (params.date) {
            where.date = new Date(params.date);
        }
        return index_1.prisma.timeSlot.findMany({
            where,
            orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
        });
    }
    static async generateSlotsForVenue(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        return (0, slotGenerator_1.generateSlotsForRange)(index_1.prisma, {
            venueId: params.venueId,
            sports: venue.sports,
            operatingHours: venue.operatingHours,
            basePrice: params.basePrice || 1000,
            daysCount: params.daysCount,
            startDate: params.startDate ? new Date(params.startDate) : undefined,
            peakPricing: venue.peakPricing,
        });
    }
    static async updateSlot(params) {
        const slot = await index_1.prisma.timeSlot.findFirst({
            where: { id: params.slotId },
            include: { venue: true },
        });
        if (!slot || slot.venue.partnerId !== params.partnerId) {
            throw new Error('Slot not found or not owned by partner');
        }
        if (params.status) {
            if (!MANUALLY_SETTABLE_STATUSES.includes(params.status)) {
                throw new Error(`Cannot set slot status to '${params.status}' directly. Use the block or match-session flows instead.`);
            }
            if (slot.status === 'booked' || slot.status === 'match_session') {
                throw new Error(`Slot is currently '${slot.status}' and cannot be changed directly. Cancel the booking or session first.`);
            }
        }
        return index_1.prisma.timeSlot.update({
            where: { id: params.slotId },
            data: {
                status: params.status || slot.status,
                price: params.price ?? slot.price,
            },
        });
    }
    static async createBlock(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const slot = await index_1.prisma.timeSlot.findFirst({ where: { id: params.slotId, venueId: params.venueId } });
        if (!slot) {
            throw new Error('Slot not found');
        }
        if (slot.status !== 'available') {
            throw new Error(`Cannot block a slot that is currently '${slot.status}'`);
        }
        const block = await index_1.prisma.slotBlock.create({
            data: {
                venueId: params.venueId,
                slotId: params.slotId,
                reason: params.reason,
                createdById: params.partnerId,
            },
        });
        await index_1.prisma.timeSlot.update({
            where: { id: params.slotId },
            data: { status: 'blocked' },
        });
        return block;
    }
    static async removeBlock(params) {
        const block = await index_1.prisma.slotBlock.findFirst({ where: { id: params.blockId } });
        if (!block) {
            throw new Error('Block not found');
        }
        const venue = await index_1.prisma.venue.findFirst({ where: { id: block.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Block not owned by partner');
        }
        await index_1.prisma.slotBlock.delete({ where: { id: params.blockId } });
        await index_1.prisma.timeSlot.updateMany({
            where: { id: block.slotId, status: 'blocked' },
            data: { status: 'available' },
        });
    }
    static async getBookingsForVenue(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const where = { venueId: params.venueId };
        if (params.date) {
            where.date = new Date(params.date);
        }
        if (params.status) {
            where.status = params.status;
        }
        const bookings = await index_1.prisma.booking.findMany({ where, orderBy: { date: 'asc' } });
        return bookings.map((booking) => ({
            ...booking,
            guestDetails: { name: booking.guestName || '', phone: booking.guestPhone || '' },
        }));
    }
    static async cancelBooking(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const booking = await index_1.prisma.booking.findFirst({ where: { id: params.bookingId, venueId: params.venueId } });
        if (!booking) {
            throw new Error('Booking not found');
        }
        if (booking.status === 'cancelled') {
            throw new Error('Booking is already cancelled');
        }
        const updated = await index_1.prisma.booking.update({
            where: { id: params.bookingId },
            data: { status: 'cancelled' },
        });
        if (booking.slotId) {
            await index_1.prisma.timeSlot.updateMany({
                where: { id: booking.slotId, status: 'booked' },
                data: { status: 'available' },
            });
        }
        return { ...updated, guestDetails: { name: updated.guestName || '', phone: updated.guestPhone || '' } };
    }
    static async createMatchSession(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const slot = await index_1.prisma.timeSlot.findFirst({ where: { id: params.slotId, venueId: params.venueId } });
        if (!slot) {
            throw new Error('Slot not found');
        }
        if (slot.status !== 'available') {
            throw new Error(`Cannot start a match session on a slot that is currently '${slot.status}'`);
        }
        const existingSession = await index_1.prisma.matchSession.findFirst({ where: { venueId: params.venueId, slotId: params.slotId } });
        if (existingSession) {
            throw new Error('A match session already exists for this slot');
        }
        const session = await index_1.prisma.matchSession.create({
            data: {
                venueId: params.venueId,
                slotId: params.slotId,
                partnerId: params.partnerId,
                date: new Date(params.date),
                startTime: params.startTime,
                endTime: params.endTime,
                sport: params.sport,
                totalPlayers: params.totalPlayers,
                minPlayersForLive: params.minPlayersForLive,
                pricePerPerson: params.pricePerPerson,
                skillLevel: params.skillLevel,
                description: params.description || '',
                status: 'pending',
                playersJoined: 0,
            },
        });
        await index_1.prisma.timeSlot.updateMany({ where: { id: params.slotId }, data: { status: 'match_session' } });
        return mapMatchSessionForClient(session);
    }
    static async getMatchSessionsForVenue(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const where = { venueId: params.venueId };
        if (params.date) {
            where.date = new Date(params.date);
        }
        if (params.status) {
            where.status = params.status;
        }
        const sessions = await index_1.prisma.matchSession.findMany({ where, orderBy: { createdAt: 'desc' } });
        return sessions.map(mapMatchSessionForClient);
    }
    static async cancelMatchSession(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const session = await index_1.prisma.matchSession.findFirst({ where: { id: params.sessionId, venueId: params.venueId } });
        if (!session) {
            throw new Error('Match session not found');
        }
        if (session.status === 'cancelled' || session.status === 'completed') {
            throw new Error(`Match session is already ${session.status}`);
        }
        const updated = await index_1.prisma.matchSession.update({
            where: { id: params.sessionId },
            data: { status: 'cancelled' },
        });
        await index_1.prisma.timeSlot.updateMany({
            where: { id: session.slotId, status: 'match_session' },
            data: { status: 'available' },
        });
        return mapMatchSessionForClient(updated);
    }
    static async setMatchSessionStatus(params) {
        const venue = await index_1.prisma.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });
        if (!venue) {
            throw new Error('Venue not found or not owned by partner');
        }
        const session = await index_1.prisma.matchSession.findFirst({ where: { id: params.sessionId, venueId: params.venueId } });
        if (!session) {
            throw new Error('Match session not found');
        }
        const allowedTransitions = {
            pending: ['live'],
            live: ['completed'],
        };
        if (!allowedTransitions[session.status]?.includes(params.status)) {
            throw new Error(`Cannot transition a '${session.status}' session to '${params.status}'`);
        }
        const updated = await index_1.prisma.matchSession.update({
            where: { id: params.sessionId },
            data: { status: params.status },
        });
        return mapMatchSessionForClient(updated);
    }
}
exports.SlotService = SlotService;
//# sourceMappingURL=slot.service.js.map