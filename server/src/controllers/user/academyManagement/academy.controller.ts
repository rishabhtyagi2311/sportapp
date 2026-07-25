import { Request, Response } from "express";
import { UserAuthRequest } from "../../../middlewares/auth.middleware";
import { AcademyService } from "../../../services/partner/academyManagement/academy";
import { ChildProfileService } from "../../../services/user/academyManagement/childProfile";
import { EnrollmentService } from "../../../services/user/academyManagement/enrollment";
import { StudentRecordsService } from "../../../services/user/academyManagement/studentRecords";
import {
  publicAcademyFiltersSchema,
  createChildProfileSchema,
  updateChildProfileSchema,
  enrollChildSchema,
} from "../../../types/user/academy";

export class UserAcademyController {
  static async list(req: Request, res: Response) {
    try {
      const parsed = publicAcademyFiltersSchema.safeParse(req.query);
      const filters = parsed.success ? parsed.data : {};

      const academies = await AcademyService.getPublicAcademies(filters);

      return res.status(200).json({ success: true, count: academies.length, data: academies });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching academies" });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { academyId } = req.params;
      const academy = await AcademyService.getPublicAcademyById(academyId);

      if (!academy) {
        return res.status(404).json({ success: false, message: "Academy not found" });
      }

      return res.status(200).json({ success: true, data: academy });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching academy" });
    }
  }

  static async getAnnouncements(req: Request, res: Response) {
    try {
      const { academyId } = req.params;
      const announcements = await AcademyService.getPublicAnnouncements(academyId);

      return res.status(200).json({ success: true, data: announcements });
    } catch (error: any) {
      return res.status(404).json({ success: false, message: error.message || "Error fetching announcements" });
    }
  }
}

export class ChildProfileController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = createChildProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid child profile data", error: parsed.error.issues });
      }

      const profile = await ChildProfileService.createChildProfile(parentId, parsed.data);

      return res.status(201).json({ success: true, message: "Child profile created", data: profile });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error creating child profile" });
    }
  }

  static async list(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const profiles = await ChildProfileService.getMyChildProfiles(parentId);

      return res.status(200).json({ success: true, data: profiles });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || "Error fetching child profiles" });
    }
  }

  static async update(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { profileId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = updateChildProfileSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid child profile data", error: parsed.error.issues });
      }

      const profile = await ChildProfileService.updateChildProfile(parentId, profileId, parsed.data);

      return res.status(200).json({ success: true, message: "Child profile updated", data: profile });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error updating child profile" });
    }
  }

  static async remove(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { profileId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      await ChildProfileService.deleteChildProfile(parentId, profileId);

      return res.status(200).json({ success: true, message: "Child profile deleted" });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error deleting child profile" });
    }
  }
}

export class EnrollmentController {
  static async create(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const parsed = enrollChildSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: "Invalid enrollment data", error: parsed.error.issues });
      }

      const enrollment = await EnrollmentService.enrollChild(parentId, parsed.data);

      return res.status(201).json({ success: true, message: "Enrolled successfully", data: enrollment });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error enrolling child" });
    }
  }

  static async list(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const { childProfileId } = req.query;

      const enrollments = childProfileId
        ? await EnrollmentService.getEnrollmentsForChild(parentId, childProfileId as string)
        : await EnrollmentService.getMyEnrollments(parentId);

      return res.status(200).json({ success: true, data: enrollments });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching enrollments" });
    }
  }

  static async withdraw(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { studentId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const enrollment = await EnrollmentService.withdrawEnrollment(parentId, studentId);

      return res.status(200).json({ success: true, message: "Enrollment withdrawn", data: enrollment });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error withdrawing enrollment" });
    }
  }
}

export class StudentRecordsController {
  static async getAttendance(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { studentId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const records = await StudentRecordsService.getChildAttendance(parentId, studentId);

      return res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching attendance" });
    }
  }

  static async getCertificates(req: UserAuthRequest, res: Response) {
    try {
      const parentId = req.user?.id;
      const { studentId } = req.params;
      if (!parentId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const certificates = await StudentRecordsService.getChildCertificates(parentId, studentId);

      return res.status(200).json({ success: true, data: certificates });
    } catch (error: any) {
      return res.status(400).json({ success: false, message: error.message || "Error fetching certificates" });
    }
  }
}
