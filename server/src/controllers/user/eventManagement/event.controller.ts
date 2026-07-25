import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { EventService } from "../../../services/user/eventManagement/event";
import { createEventSchema, updateEventSchema, publicEventFiltersSchema } from "../../../types/user/event";

export class EventController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
      }

      const event = await EventService.createEvent(userId, parsed.data);

      return res.status(201).json({ success: true, message: "Event created successfully", data: event });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating event" });
    }
  }

  static async list(req: Request, res: Response) {
    try {
      const parsed = publicEventFiltersSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};

      const events = await EventService.getPublicEvents(filters);

      return res.status(200).json({ success: true, count: events.length, data: events });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching events" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const events = await EventService.getMyEvents(userId);

      return res.status(200).json({ success: true, data: events });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching your events" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const event = await EventService.getEventById(id);

      if (!event) {
        return res.status(404).json({ success: false, message: "Event not found" });
      }

      return res.status(200).json({ success: true, data: event });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching event" });
    }
  }

  static async update(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = updateEventSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid event data", error: parsed.error.issues });
      }

      const event = await EventService.updateEvent(userId, id, parsed.data);

      return res.status(200).json({ success: true, message: "Event updated successfully", data: event });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error updating event" });
    }
  }

  static async remove(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await EventService.deleteEvent(userId, id);

      return res.status(200).json({ success: true, message: "Event deleted successfully" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error deleting event" });
    }
  }
}
