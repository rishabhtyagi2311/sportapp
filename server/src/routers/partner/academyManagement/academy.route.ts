import { Router } from 'express';
import { AcademyController } from '../../../controllers/partner/academyManagement/academy.controller';
import { authenticatePartner } from '../../../middlewares/auth.middleware';

const router = Router();

router.get('/academies', authenticatePartner, AcademyController.getMyAcademies);
router.post('/academies', authenticatePartner, AcademyController.create);
router.get('/academies/:academyId', authenticatePartner, AcademyController.getById);
router.put('/academies/:academyId', authenticatePartner, AcademyController.update);
router.delete('/academies/:academyId', authenticatePartner, AcademyController.remove);
router.post('/academies/:academyId/coaches', authenticatePartner, AcademyController.addCoach);
router.put('/academies/:academyId/coaches/:coachId', authenticatePartner, AcademyController.updateCoach);
router.delete('/academies/:academyId/coaches/:coachId', authenticatePartner, AcademyController.removeCoach);

router.post('/academies/:academyId/students', authenticatePartner, AcademyController.addStudent);
router.get('/academies/:academyId/students', authenticatePartner, AcademyController.getStudents);
router.put('/academies/:academyId/students/:studentId', authenticatePartner, AcademyController.updateStudent);
router.delete('/academies/:academyId/students/:studentId', authenticatePartner, AcademyController.removeStudent);

router.get('/academies/:academyId/attendance', authenticatePartner, AcademyController.getAcademyAttendance);
router.post('/students/:studentId/attendance', authenticatePartner, AcademyController.markAttendance);
router.get('/students/:studentId/attendance', authenticatePartner, AcademyController.getStudentAttendance);

router.post('/academies/:academyId/photos', authenticatePartner, AcademyController.addPhoto);
router.get('/academies/:academyId/photos', authenticatePartner, AcademyController.getPhotos);
router.delete('/academies/:academyId/photos/:photoId', authenticatePartner, AcademyController.removePhoto);

router.post('/students/:studentId/certificates', authenticatePartner, AcademyController.createCertificate);
router.get('/academies/:academyId/certificates', authenticatePartner, AcademyController.getAcademyCertificates);

export default router;
