import { Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { EventRegistrationService } from "../../../services/user/eventManagement/registration";
import { createRegistrationSchema, processRegistrationSchema } from "../../../types/user/event";

export class EventRegistrationController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: eventId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createRegistrationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid registration data", error: parsed.error.issues });
      }

      const registration = await EventRegistrationService.createRegistration(userId, eventId, parsed.data);

      return res.status(201).json({ success: true, message: "Registration submitted", data: registration });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error submitting registration" });
    }
  }

  static async listForEvent(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: eventId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const registrations = await EventRegistrationService.getRegistrationsForEvent(userId, eventId);

      return res.status(200).json({ success: true, data: registrations });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching registrations" });
    }
  }

  static async mine(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const registrations = await EventRegistrationService.getMyRegistrations(userId);

      return res.status(200).json({ success: true, data: registrations });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching your registrations" });
    }
  }

  static async process(req: UserAuthRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { id: eventId, registrationId } = req.params;
      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = processRegistrationSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid request", error: parsed.error.issues });
      }

      const registration = await EventRegistrationService.processRegistration(
        userId,
        eventId,
        registrationId,
        parsed.data
      );

      return res.status(200).json({ success: true, message: "Registration processed", data: registration });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error processing registration" });
    }
  }
}
