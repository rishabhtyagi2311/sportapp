import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { SlotService } from '../../../services/partner/venueManagement/slot.service';

export class SlotController {
  static async getSlots(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;
      const { date, startDate, endDate, varietyId, status } = req.query;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const slots = await SlotService.getSlotsForVenue({
        venueId,
        partnerId,
        date: date as string | undefined,
        startDate: startDate as string | undefined,
        endDate: endDate as string | undefined,
        varietyId: varietyId as string | undefined,
        status: status as string | undefined,
      });

      return res.status(200).json({ success: true, data: slots });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching slots' });
    }
  }

  static async generateSlots(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;
      const { daysCount, basePrice, startDate } = req.body;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const generatedCount = await SlotService.generateSlotsForVenue({
        venueId,
        partnerId,
        daysCount,
        basePrice,
        startDate,
      });

      return res.status(200).json({ success: true, message: 'Slots generated successfully', data: { generatedCount } });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error generating slots' });
    }
  }

  static async updateSlot(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { slotId } = req.params;
      const { status, price, reason } = req.body;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const slot = await SlotService.updateSlot({ slotId, partnerId, status, price, reason });

      return res.status(200).json({ success: true, data: slot });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating slot' });
    }
  }

  static async createBlock(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId, slotId, reason, date } = req.body;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const block = await SlotService.createBlock({ partnerId, venueId, slotId, reason, date });

      return res.status(201).json({ success: true, data: block });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error creating slot block' });
    }
  }

  static async removeBlock(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { blockId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await SlotService.removeBlock({ partnerId, blockId });

      return res.status(200).json({ success: true, message: 'Block removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error removing block' });
    }
  }

  static async getBookings(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;
      const { date, status } = req.query;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const bookings = await SlotService.getBookingsForVenue({
        venueId,
        partnerId,
        date: date as string | undefined,
        status: status as string | undefined,
      });

      return res.status(200).json({ success: true, data: bookings });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching bookings' });
    }
  }

  static async cancelBooking(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId, bookingId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const booking = await SlotService.cancelBooking({ partnerId, venueId, bookingId });

      return res.status(200).json({ success: true, message: 'Booking cancelled successfully', data: booking });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Error cancelling booking' });
    }
  }

  static async createMatchSession(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const body = req.body;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const session = await SlotService.createMatchSession({ partnerId, ...body });

      return res.status(201).json({ success: true, message: 'Match published successfully', data: session });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error creating match session' });
    }
  }

  static async getMatchSessions(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId } = req.params;
      const { date, status } = req.query;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const sessions = await SlotService.getMatchSessionsForVenue({
        venueId,
        partnerId,
        date: date as string | undefined,
        status: status as string | undefined,
      });

      return res.status(200).json({ success: true, data: sessions });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching match sessions' });
    }
  }

  static async cancelMatchSession(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId, sessionId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const session = await SlotService.cancelMatchSession({ partnerId, venueId, sessionId });

      return res.status(200).json({ success: true, message: 'Match session cancelled successfully', data: session });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Error cancelling match session' });
    }
  }

  static async updateMatchSessionStatus(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { venueId, sessionId } = req.params;
      const { status } = req.body;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (status !== 'live' && status !== 'completed') {
        return res.status(400).json({ success: false, message: "Status must be 'live' or 'completed'" });
      }

      const session = await SlotService.setMatchSessionStatus({ partnerId, venueId, sessionId, status });

      return res.status(200).json({ success: true, message: 'Match session status updated successfully', data: session });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || 'Error updating match session status' });
    }
  }
}
