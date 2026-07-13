import { Response } from 'express';
import { AuthRequest } from '../../../middlewares/auth.middleware';
import { AcademyService } from '../../../services/partner/academyManagement/academy';
import {
  createAcademySchema,
  updateAcademySchema,
  addCoachSchema,
  updateCoachSchema,
  addStudentSchema,
  updateStudentSchema,
  markAttendanceSchema,
  addPhotoSchema,
  createCertificateSchema,
  createAnnouncementSchema,
} from '../../../types/partner/academy';

export class AcademyController {
  static async create(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = createAcademySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid academy data', error: parsed.error.issues });
      }

      const academy = await AcademyService.createAcademy(parsed.data, partnerId);

      return res.status(201).json({ success: true, message: 'Academy registered successfully', data: academy });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error creating academy' });
    }
  }

  static async getMyAcademies(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const academies = await AcademyService.getAcademiesByPartner(partnerId);

      return res.status(200).json({ success: true, count: academies.length, data: academies });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching academies' });
    }
  }

  static async getById(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const academy = await AcademyService.getAcademyById(academyId, partnerId);

      if (!academy) {
        return res.status(404).json({ success: false, message: 'Academy not found' });
      }

      return res.status(200).json({ success: true, data: academy });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching academy' });
    }
  }

  static async update(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = updateAcademySchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid academy data', error: parsed.error.issues });
      }

      const academy = await AcademyService.updateAcademy(academyId, partnerId, parsed.data);

      return res.status(200).json({ success: true, message: 'Academy updated successfully', data: academy });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating academy' });
    }
  }

  static async remove(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await AcademyService.deleteAcademy(academyId, partnerId);

      return res.status(200).json({ success: true, message: 'Academy deleted successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error deleting academy' });
    }
  }

  static async addCoach(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = addCoachSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid coach data', error: parsed.error.issues });
      }

      const coach = await AcademyService.addCoach(academyId, partnerId, parsed.data);

      return res.status(201).json({ success: true, message: 'Coach added successfully', data: coach });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error adding coach' });
    }
  }

  static async updateCoach(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, coachId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = updateCoachSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid coach data', error: parsed.error.issues });
      }

      const coach = await AcademyService.updateCoach(academyId, partnerId, coachId, parsed.data);

      return res.status(200).json({ success: true, message: 'Coach updated successfully', data: coach });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating coach' });
    }
  }

  static async removeCoach(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, coachId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await AcademyService.removeCoach(academyId, partnerId, coachId);

      return res.status(200).json({ success: true, message: 'Coach removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error removing coach' });
    }
  }

  /* -------------------------------------------------------------- */
  /* STUDENTS                                                        */
  /* -------------------------------------------------------------- */

  static async addStudent(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = addStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid student data', error: parsed.error.issues });
      }

      const student = await AcademyService.addStudent(academyId, partnerId, parsed.data);

      return res.status(201).json({ success: true, message: 'Student added successfully', data: student });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error adding student' });
    }
  }

  static async getStudents(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const students = await AcademyService.getStudentsByAcademy(academyId, partnerId);

      return res.status(200).json({ success: true, data: students });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching students' });
    }
  }

  static async updateStudent(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, studentId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = updateStudentSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid student data', error: parsed.error.issues });
      }

      const student = await AcademyService.updateStudent(academyId, partnerId, studentId, parsed.data);

      return res.status(200).json({ success: true, message: 'Student updated successfully', data: student });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error updating student' });
    }
  }

  static async removeStudent(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, studentId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await AcademyService.deleteStudent(academyId, partnerId, studentId);

      return res.status(200).json({ success: true, message: 'Student removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error removing student' });
    }
  }

  /* -------------------------------------------------------------- */
  /* ATTENDANCE                                                      */
  /* -------------------------------------------------------------- */

  static async markAttendance(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { studentId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = markAttendanceSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid attendance data', error: parsed.error.issues });
      }

      const record = await AcademyService.markAttendance(studentId, partnerId, parsed.data);

      return res.status(200).json({ success: true, data: record });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error marking attendance' });
    }
  }

  static async getAcademyAttendance(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;
      const { date } = req.query;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const records = await AcademyService.getAttendanceForAcademy(academyId, partnerId, date as string | undefined);

      return res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching attendance' });
    }
  }

  static async getStudentAttendance(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { studentId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const records = await AcademyService.getAttendanceForStudent(studentId, partnerId);

      return res.status(200).json({ success: true, data: records });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching attendance' });
    }
  }

  /* -------------------------------------------------------------- */
  /* PHOTOS                                                          */
  /* -------------------------------------------------------------- */

  static async addPhoto(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = addPhotoSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid photo data', error: parsed.error.issues });
      }

      const photo = await AcademyService.addPhoto(academyId, partnerId, parsed.data.url);

      return res.status(201).json({ success: true, data: photo });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error adding photo' });
    }
  }

  static async getPhotos(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const photos = await AcademyService.getPhotosByAcademy(academyId, partnerId);

      return res.status(200).json({ success: true, data: photos });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching photos' });
    }
  }

  static async removePhoto(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, photoId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await AcademyService.removePhoto(academyId, partnerId, photoId);

      return res.status(200).json({ success: true, message: 'Photo removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error removing photo' });
    }
  }

  /* -------------------------------------------------------------- */
  /* CERTIFICATES                                                    */
  /* -------------------------------------------------------------- */

  static async createCertificate(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { studentId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = createCertificateSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid certificate data', error: parsed.error.issues });
      }

      const certificate = await AcademyService.createCertificate(studentId, partnerId, parsed.data);

      return res.status(201).json({ success: true, message: 'Certificate generated successfully', data: certificate });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error generating certificate' });
    }
  }

  static async getAcademyCertificates(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const certificates = await AcademyService.getCertificatesByAcademy(academyId, partnerId);

      return res.status(200).json({ success: true, data: certificates });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching certificates' });
    }
  }

  /* -------------------------------------------------------------- */
  /* ANNOUNCEMENTS                                                   */
  /* -------------------------------------------------------------- */

  static async createAnnouncement(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const parsed = createAnnouncementSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ success: false, message: 'Invalid announcement data', error: parsed.error.issues });
      }

      const announcement = await AcademyService.createAnnouncement(academyId, partnerId, parsed.data.content);

      return res.status(201).json({ success: true, message: 'Announcement posted successfully', data: announcement });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error posting announcement' });
    }
  }

  static async getAnnouncements(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const announcements = await AcademyService.getAnnouncementsByAcademy(academyId, partnerId);

      return res.status(200).json({ success: true, data: announcements });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error fetching announcements' });
    }
  }

  static async removeAnnouncement(req: AuthRequest, res: Response) {
    try {
      const partnerId = req.partner?.id;
      const { academyId, announcementId } = req.params;

      if (!partnerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      await AcademyService.removeAnnouncement(academyId, partnerId, announcementId);

      return res.status(200).json({ success: true, message: 'Announcement removed successfully' });
    } catch (error: any) {
      return res.status(500).json({ success: false, message: error.message || 'Error removing announcement' });
    }
  }
}
