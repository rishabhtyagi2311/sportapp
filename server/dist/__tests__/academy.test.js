"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const supertest_1 = __importDefault(require("supertest"));
const app_1 = __importDefault(require("../app"));
const auth_1 = require("./helpers/auth");
beforeEach(() => {
    (0, prismaMock_1.resetPrismaMock)();
});
const PARTNER_ID = 'partner-1';
const ACADEMY_ID = 'academy-1';
function fakeAcademy(overrides = {}) {
    return {
        id: ACADEMY_ID,
        partnerId: PARTNER_ID,
        academyName: 'Champions Academy',
        sportType: 'Football',
        address: '123 Main St',
        city: 'Mumbai',
        coachName: 'Coach Carter',
        contactNumber: '9999999999',
        facilities: 'Full-size turf',
        fee: 1500,
        feeStructure: 'Monthly',
        isActive: true,
        coaches: [],
        photos: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        ...overrides,
    };
}
describe('POST /api/v1/partner/academies', () => {
    it('registers a new academy', async () => {
        prismaMock_1.prismaMock.academy.create.mockResolvedValue(fakeAcademy());
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/partner/academies')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({
            academyName: 'Champions Academy',
            sportType: 'Football',
            address: '123 Main St',
            city: 'Mumbai',
            coachName: 'Coach Carter',
            contactNumber: '9999999999',
            facilities: 'Full-size turf',
            fee: 1500,
        });
        expect(res.status).toBe(201);
        expect(res.body.data.academyName).toBe('Champions Academy');
    });
    it('rejects invalid academy data', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/partner/academies')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ academyName: 'ab' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.academy.create).not.toHaveBeenCalled();
    });
});
describe('Students', () => {
    it('adds a student to an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.student.create.mockResolvedValue({
            id: 'student-1',
            academyId: ACADEMY_ID,
            name: 'Alex',
            age: 12,
            fatherName: 'John',
            fatherContact: '9999999998',
            enrollmentDate: new Date(),
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/students`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'Alex', age: 12, fatherName: 'John', fatherContact: '9999999998' });
        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe('Alex');
    });
    it('refuses to add a student to an academy not owned by the partner', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/students`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'Alex', age: 12, fatherName: 'John', fatherContact: '9999999998' });
        expect(res.status).toBe(500);
        expect(prismaMock_1.prismaMock.student.create).not.toHaveBeenCalled();
    });
});
describe('Enrollment approval', () => {
    function fakePendingStudent(overrides = {}) {
        return {
            id: 'student-1',
            academyId: ACADEMY_ID,
            childProfileId: 'child-1',
            name: 'Timmy',
            age: 10,
            fatherName: 'Jane Doe',
            fatherContact: '9999999999',
            status: 'pending',
            enrollmentDate: new Date(),
            createdAt: new Date(),
            ...overrides,
        };
    }
    it('lists pending enrollments for an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.student.findMany.mockResolvedValue([fakePendingStudent()]);
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/partner/academies/${ACADEMY_ID}/students?status=pending`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
        expect(prismaMock_1.prismaMock.student.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: expect.objectContaining({ academyId: ACADEMY_ID, status: 'pending' }) }));
    });
    it('approves a pending enrollment', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue(fakePendingStudent());
        prismaMock_1.prismaMock.student.update.mockResolvedValue(fakePendingStudent({ status: 'active' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch(`/api/v1/partner/academies/${ACADEMY_ID}/students/student-1/approve`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('active');
    });
    it('rejects a pending enrollment', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue(fakePendingStudent());
        prismaMock_1.prismaMock.student.update.mockResolvedValue(fakePendingStudent({ status: 'inactive' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch(`/api/v1/partner/academies/${ACADEMY_ID}/students/student-1/reject`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('inactive');
    });
    it('refuses to approve an enrollment that is not pending', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue(fakePendingStudent({ status: 'active' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .patch(`/api/v1/partner/academies/${ACADEMY_ID}/students/student-1/approve`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.student.update).not.toHaveBeenCalled();
    });
    it('refuses to approve an enrollment for an academy owned by another partner', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .patch(`/api/v1/partner/academies/${ACADEMY_ID}/students/student-1/approve`)
            .set((0, auth_1.authHeader)('partner-2'));
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.student.update).not.toHaveBeenCalled();
    });
});
describe('Coaches', () => {
    it('adds a coach to an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.coach.create.mockResolvedValue({
            id: 'coach-1',
            academyId: ACADEMY_ID,
            name: 'Sam',
            specialization: 'Goalkeeping',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/coaches`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ name: 'Sam', specialization: 'Goalkeeping' });
        expect(res.status).toBe(201);
        expect(res.body.data.name).toBe('Sam');
    });
});
describe('Photos', () => {
    it('adds a photo to an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.academyPhoto.create.mockResolvedValue({
            id: 'photo-1',
            academyId: ACADEMY_ID,
            url: 'https://cdn.example.com/photo.jpg',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/photos`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ url: 'https://cdn.example.com/photo.jpg' });
        expect(res.status).toBe(201);
        expect(res.body.data.url).toBe('https://cdn.example.com/photo.jpg');
    });
    it('removes a photo from an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.academyPhoto.findFirst.mockResolvedValue({ id: 'photo-1', academyId: ACADEMY_ID });
        prismaMock_1.prismaMock.academyPhoto.delete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/partner/academies/${ACADEMY_ID}/photos/photo-1`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.academyPhoto.delete).toHaveBeenCalledWith({ where: { id: 'photo-1' } });
    });
});
describe('Certificates', () => {
    it('generates a certificate for a student', async () => {
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue({
            id: 'student-1',
            name: 'Alex',
            academy: fakeAcademy(),
        });
        prismaMock_1.prismaMock.certificate.create.mockResolvedValue({
            id: 'cert-1',
            studentId: 'student-1',
            template: 'gold',
            studentName: 'Alex',
            academyName: 'Champions Academy',
            achievement: 'Top Scorer',
            date: new Date(),
            certificateNumber: 'CERT-123',
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/partner/students/student-1/certificates')
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ template: 'gold', achievement: 'Top Scorer' });
        expect(res.status).toBe(201);
        expect(res.body.data.certificateNumber).toBe('CERT-123');
    });
});
describe('Announcements (Info Channel)', () => {
    it('posts an announcement to an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.announcement.create.mockResolvedValue({
            id: 'ann-1',
            academyId: ACADEMY_ID,
            content: 'Practice cancelled today',
            createdAt: new Date(),
        });
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ content: 'Practice cancelled today' });
        expect(res.status).toBe(201);
        expect(res.body.data.content).toBe('Practice cancelled today');
    });
    it('rejects an empty announcement', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .post(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
            .set((0, auth_1.authHeader)(PARTNER_ID))
            .send({ content: '' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.announcement.create).not.toHaveBeenCalled();
    });
    it('lists announcements newest-first for an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.announcement.findMany.mockResolvedValue([
            { id: 'ann-2', academyId: ACADEMY_ID, content: 'Second', createdAt: new Date() },
            { id: 'ann-1', academyId: ACADEMY_ID, content: 'First', createdAt: new Date() },
        ]);
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(2);
        expect(prismaMock_1.prismaMock.announcement.findMany).toHaveBeenCalledWith(expect.objectContaining({ where: { academyId: ACADEMY_ID }, orderBy: { createdAt: 'desc' } }));
    });
    it('refuses to list announcements for an academy not owned by the partner', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .get(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(500);
        expect(res.body.success).toBe(false);
    });
    it('removes an announcement from an owned academy', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.announcement.findFirst.mockResolvedValue({ id: 'ann-1', academyId: ACADEMY_ID });
        prismaMock_1.prismaMock.announcement.delete.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/partner/academies/${ACADEMY_ID}/announcements/ann-1`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(200);
        expect(prismaMock_1.prismaMock.announcement.delete).toHaveBeenCalledWith({ where: { id: 'ann-1' } });
    });
    it('returns an error deleting an announcement that does not exist', async () => {
        prismaMock_1.prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy());
        prismaMock_1.prismaMock.announcement.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .delete(`/api/v1/partner/academies/${ACADEMY_ID}/announcements/missing-id`)
            .set((0, auth_1.authHeader)(PARTNER_ID));
        expect(res.status).toBe(500);
        expect(prismaMock_1.prismaMock.announcement.delete).not.toHaveBeenCalled();
    });
});
//# sourceMappingURL=academy.test.js.map