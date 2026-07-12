import { prisma as globalClient } from '../../../index';
import { generateSlotsForRange } from './slotGenerator';

const MANUALLY_SETTABLE_STATUSES = ['available', 'blocked'];

function mapMatchSessionForClient(session: any) {
  return {
    ...session,
    date: session.date.toISOString().split('T')[0],
  };
}

export class SlotService {
  static async getSlotsForVenue(params: {
    venueId: string;
    partnerId: string;
    date?: string;
    startDate?: string;
    endDate?: string;
    varietyId?: string;
    status?: string;
  }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const where: any = { venueId: params.venueId };

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

    const slots = await globalClient.timeSlot.findMany({
      where,
      orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
    });

    const blockedSlotIds = slots.filter((s) => s.status === 'blocked').map((s) => s.id);

    if (blockedSlotIds.length === 0) {
      return slots;
    }

    const blocks = await globalClient.slotBlock.findMany({
      where: { slotId: { in: blockedSlotIds } },
      orderBy: { createdAt: 'desc' },
    });

    const blockBySlotId = new Map<string, { id: string; reason: string }>();
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

  static async generateSlotsForVenue(params: {
    venueId: string;
    partnerId: string;
    daysCount?: number;
    basePrice?: number;
    startDate?: string;
  }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    return generateSlotsForRange(globalClient, {
      venueId: params.venueId,
      sports: venue.sports as any[],
      operatingHours: venue.operatingHours as any,
      basePrice: params.basePrice || 1000,
      daysCount: params.daysCount,
      startDate: params.startDate ? new Date(params.startDate) : undefined,
      peakPricing: venue.peakPricing as any,
    });
  }

  static async updateSlot(params: {
    slotId: string;
    partnerId: string;
    status?: string;
    price?: number;
    reason?: string;
  }) {
    const slot = await globalClient.timeSlot.findFirst({
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

    return globalClient.timeSlot.update({
      where: { id: params.slotId },
      data: {
        status: params.status || slot.status,
        price: params.price ?? slot.price,
      },
    });
  }

  static async createBlock(params: {
    partnerId: string;
    venueId: string;
    slotId: string;
    reason: string;
    date?: string;
  }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const slot = await globalClient.timeSlot.findFirst({ where: { id: params.slotId, venueId: params.venueId } });

    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.status !== 'available') {
      throw new Error(`Cannot block a slot that is currently '${slot.status}'`);
    }

    const block = await globalClient.slotBlock.create({
      data: {
        venueId: params.venueId,
        slotId: params.slotId,
        reason: params.reason,
        createdById: params.partnerId,
      },
    });

    await globalClient.timeSlot.update({
      where: { id: params.slotId },
      data: { status: 'blocked' },
    });

    return block;
  }

  static async removeBlock(params: { partnerId: string; blockId: string }) {
    const block = await globalClient.slotBlock.findFirst({ where: { id: params.blockId } });

    if (!block) {
      throw new Error('Block not found');
    }

    const venue = await globalClient.venue.findFirst({ where: { id: block.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Block not owned by partner');
    }

    await globalClient.slotBlock.delete({ where: { id: params.blockId } });
    await globalClient.timeSlot.updateMany({
      where: { id: block.slotId, status: 'blocked' },
      data: { status: 'available' },
    });
  }

  static async getBookingsForVenue(params: { venueId: string; partnerId: string; date?: string; status?: string }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const where: any = { venueId: params.venueId };

    if (params.date) {
      where.date = new Date(params.date);
    }

    if (params.status) {
      where.status = params.status;
    }

    const bookings = await globalClient.booking.findMany({ where, orderBy: { date: 'asc' } });

    return bookings.map((booking) => ({
      ...booking,
      guestDetails: { name: booking.guestName || '', phone: booking.guestPhone || '' },
    }));
  }

  static async cancelBooking(params: { partnerId: string; venueId: string; bookingId: string }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const booking = await globalClient.booking.findFirst({ where: { id: params.bookingId, venueId: params.venueId } });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status === 'cancelled') {
      throw new Error('Booking is already cancelled');
    }

    const updated = await globalClient.booking.update({
      where: { id: params.bookingId },
      data: { status: 'cancelled' },
    });

    if (booking.slotId) {
      await globalClient.timeSlot.updateMany({
        where: { id: booking.slotId, status: 'booked' },
        data: { status: 'available' },
      });
    }

    return { ...updated, guestDetails: { name: updated.guestName || '', phone: updated.guestPhone || '' } };
  }

  static async createMatchSession(params: {
    partnerId: string;
    venueId: string;
    slotId: string;
    date: string;
    startTime: string;
    endTime: string;
    sport: string;
    totalPlayers: number;
    minPlayersForLive: number;
    pricePerPerson: number;
    skillLevel: string;
    description?: string;
  }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const slot = await globalClient.timeSlot.findFirst({ where: { id: params.slotId, venueId: params.venueId } });

    if (!slot) {
      throw new Error('Slot not found');
    }

    if (slot.status !== 'available') {
      throw new Error(`Cannot start a match session on a slot that is currently '${slot.status}'`);
    }

    const existingSession = await globalClient.matchSession.findFirst({ where: { venueId: params.venueId, slotId: params.slotId } });

    if (existingSession) {
      throw new Error('A match session already exists for this slot');
    }

    const session = await globalClient.matchSession.create({
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

    await globalClient.timeSlot.updateMany({ where: { id: params.slotId }, data: { status: 'match_session' } });

    return mapMatchSessionForClient(session);
  }

  static async getMatchSessionsForVenue(params: { venueId: string; partnerId: string; date?: string; status?: string }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const where: any = { venueId: params.venueId };

    if (params.date) {
      where.date = new Date(params.date);
    }

    if (params.status) {
      where.status = params.status;
    }

    const sessions = await globalClient.matchSession.findMany({ where, orderBy: { createdAt: 'desc' } });
    return sessions.map(mapMatchSessionForClient);
  }

  static async cancelMatchSession(params: { partnerId: string; venueId: string; sessionId: string }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const session = await globalClient.matchSession.findFirst({ where: { id: params.sessionId, venueId: params.venueId } });

    if (!session) {
      throw new Error('Match session not found');
    }

    if (session.status === 'cancelled' || session.status === 'completed') {
      throw new Error(`Match session is already ${session.status}`);
    }

    const updated = await globalClient.matchSession.update({
      where: { id: params.sessionId },
      data: { status: 'cancelled' },
    });

    await globalClient.timeSlot.updateMany({
      where: { id: session.slotId, status: 'match_session' },
      data: { status: 'available' },
    });

    return mapMatchSessionForClient(updated);
  }

  static async setMatchSessionStatus(params: { partnerId: string; venueId: string; sessionId: string; status: 'live' | 'completed' }) {
    const venue = await globalClient.venue.findFirst({ where: { id: params.venueId, partnerId: params.partnerId } });

    if (!venue) {
      throw new Error('Venue not found or not owned by partner');
    }

    const session = await globalClient.matchSession.findFirst({ where: { id: params.sessionId, venueId: params.venueId } });

    if (!session) {
      throw new Error('Match session not found');
    }

    const allowedTransitions: Record<string, string[]> = {
      pending: ['live'],
      live: ['completed'],
    };

    if (!allowedTransitions[session.status]?.includes(params.status)) {
      throw new Error(`Cannot transition a '${session.status}' session to '${params.status}'`);
    }

    const updated = await globalClient.matchSession.update({
      where: { id: params.sessionId },
      data: { status: params.status },
    });

    return mapMatchSessionForClient(updated);
  }
}
