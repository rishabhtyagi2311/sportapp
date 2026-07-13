import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { authHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

const PARTNER_ID = 'partner-1';
const ACADEMY_ID = 'academy-1';

function fakeAcademy(overrides: Partial<any> = {}) {
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
    prismaMock.academy.create.mockResolvedValue(fakeAcademy() as any);

    const res = await request(app)
      .post('/api/v1/partner/academies')
      .set(authHeader(PARTNER_ID))
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
    const res = await request(app)
      .post('/api/v1/partner/academies')
      .set(authHeader(PARTNER_ID))
      .send({ academyName: 'ab' });

    expect(res.status).toBe(400);
    expect(prismaMock.academy.create).not.toHaveBeenCalled();
  });
});

describe('Students', () => {
  it('adds a student to an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.student.create.mockResolvedValue({
      id: 'student-1',
      academyId: ACADEMY_ID,
      name: 'Alex',
      age: 12,
      fatherName: 'John',
      fatherContact: '9999999998',
      enrollmentDate: new Date(),
    } as any);

    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/students`)
      .set(authHeader(PARTNER_ID))
      .send({ name: 'Alex', age: 12, fatherName: 'John', fatherContact: '9999999998' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Alex');
  });

  it('refuses to add a student to an academy not owned by the partner', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/students`)
      .set(authHeader(PARTNER_ID))
      .send({ name: 'Alex', age: 12, fatherName: 'John', fatherContact: '9999999998' });

    expect(res.status).toBe(500);
    expect(prismaMock.student.create).not.toHaveBeenCalled();
  });
});

describe('Coaches', () => {
  it('adds a coach to an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.coach.create.mockResolvedValue({
      id: 'coach-1',
      academyId: ACADEMY_ID,
      name: 'Sam',
      specialization: 'Goalkeeping',
    } as any);

    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/coaches`)
      .set(authHeader(PARTNER_ID))
      .send({ name: 'Sam', specialization: 'Goalkeeping' });

    expect(res.status).toBe(201);
    expect(res.body.data.name).toBe('Sam');
  });
});

describe('Photos', () => {
  it('adds a photo to an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.academyPhoto.create.mockResolvedValue({
      id: 'photo-1',
      academyId: ACADEMY_ID,
      url: 'https://cdn.example.com/photo.jpg',
    } as any);

    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/photos`)
      .set(authHeader(PARTNER_ID))
      .send({ url: 'https://cdn.example.com/photo.jpg' });

    expect(res.status).toBe(201);
    expect(res.body.data.url).toBe('https://cdn.example.com/photo.jpg');
  });

  it('removes a photo from an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.academyPhoto.findFirst.mockResolvedValue({ id: 'photo-1', academyId: ACADEMY_ID } as any);
    prismaMock.academyPhoto.delete.mockResolvedValue({} as any);

    const res = await request(app)
      .delete(`/api/v1/partner/academies/${ACADEMY_ID}/photos/photo-1`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(prismaMock.academyPhoto.delete).toHaveBeenCalledWith({ where: { id: 'photo-1' } });
  });
});

describe('Certificates', () => {
  it('generates a certificate for a student', async () => {
    prismaMock.student.findFirst.mockResolvedValue({
      id: 'student-1',
      name: 'Alex',
      academy: fakeAcademy(),
    } as any);
    prismaMock.certificate.create.mockResolvedValue({
      id: 'cert-1',
      studentId: 'student-1',
      template: 'gold',
      studentName: 'Alex',
      academyName: 'Champions Academy',
      achievement: 'Top Scorer',
      date: new Date(),
      certificateNumber: 'CERT-123',
    } as any);

    const res = await request(app)
      .post('/api/v1/partner/students/student-1/certificates')
      .set(authHeader(PARTNER_ID))
      .send({ template: 'gold', achievement: 'Top Scorer' });

    expect(res.status).toBe(201);
    expect(res.body.data.certificateNumber).toBe('CERT-123');
  });
});

describe('Announcements (Info Channel)', () => {
  it('posts an announcement to an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.announcement.create.mockResolvedValue({
      id: 'ann-1',
      academyId: ACADEMY_ID,
      content: 'Practice cancelled today',
      createdAt: new Date(),
    } as any);

    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
      .set(authHeader(PARTNER_ID))
      .send({ content: 'Practice cancelled today' });

    expect(res.status).toBe(201);
    expect(res.body.data.content).toBe('Practice cancelled today');
  });

  it('rejects an empty announcement', async () => {
    const res = await request(app)
      .post(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
      .set(authHeader(PARTNER_ID))
      .send({ content: '' });

    expect(res.status).toBe(400);
    expect(prismaMock.announcement.create).not.toHaveBeenCalled();
  });

  it('lists announcements newest-first for an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.announcement.findMany.mockResolvedValue([
      { id: 'ann-2', academyId: ACADEMY_ID, content: 'Second', createdAt: new Date() },
      { id: 'ann-1', academyId: ACADEMY_ID, content: 'First', createdAt: new Date() },
    ] as any);

    const res = await request(app)
      .get(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(prismaMock.announcement.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { academyId: ACADEMY_ID }, orderBy: { createdAt: 'desc' } })
    );
  });

  it('refuses to list announcements for an academy not owned by the partner', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get(`/api/v1/partner/academies/${ACADEMY_ID}/announcements`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('removes an announcement from an owned academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.announcement.findFirst.mockResolvedValue({ id: 'ann-1', academyId: ACADEMY_ID } as any);
    prismaMock.announcement.delete.mockResolvedValue({} as any);

    const res = await request(app)
      .delete(`/api/v1/partner/academies/${ACADEMY_ID}/announcements/ann-1`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(200);
    expect(prismaMock.announcement.delete).toHaveBeenCalledWith({ where: { id: 'ann-1' } });
  });

  it('returns an error deleting an announcement that does not exist', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.announcement.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .delete(`/api/v1/partner/academies/${ACADEMY_ID}/announcements/missing-id`)
      .set(authHeader(PARTNER_ID));

    expect(res.status).toBe(500);
    expect(prismaMock.announcement.delete).not.toHaveBeenCalled();
  });
});
