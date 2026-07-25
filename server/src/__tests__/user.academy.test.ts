import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeAcademy(overrides: Partial<any> = {}) {
  return {
    id: 'academy-1',
    partnerId: 'partner-1',
    academyName: 'Champions Football Academy',
    sportType: 'Football',
    address: '123 Main St',
    city: 'Mumbai',
    coachName: 'John Doe',
    contactNumber: '9999999999',
    facilities: 'Turf, floodlights',
    fee: 2000,
    feeStructure: 'Monthly',
    isActive: true,
    coaches: [],
    photos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function fakeChildProfile(overrides: Partial<any> = {}) {
  return {
    id: 'child-1',
    parentId: 1,
    childName: 'Timmy',
    childAge: 10,
    motherName: null,
    fatherName: 'Jane Doe',
    fatherContact: '9999999999',
    address: null,
    city: 'Mumbai',
    createdAt: new Date(),
    ...overrides,
  };
}

describe('GET /api/v1/user/academies', () => {
  it('lists active academies without requiring auth', async () => {
    prismaMock.academy.findMany.mockResolvedValue([fakeAcademy()] as any);

    const res = await request(app).get('/api/v1/user/academies');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.academy.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ isActive: true }) })
    );
  });
});

describe('GET /api/v1/user/academies/:id', () => {
  it('returns 404 for an inactive or missing academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/academies/academy-404');

    expect(res.status).toBe(404);
  });
});

describe('Child profile CRUD', () => {
  it('requires authentication to create a profile', async () => {
    const res = await request(app).post('/api/v1/user/child-profiles').send({
      childName: 'Timmy',
      childAge: 10,
      fatherName: 'Jane Doe',
    });
    expect(res.status).toBe(401);
  });

  it('creates a child profile for the authenticated parent', async () => {
    prismaMock.childProfile.create.mockResolvedValue(fakeChildProfile() as any);

    const res = await request(app)
      .post('/api/v1/user/child-profiles')
      .set(userAuthHeader(1))
      .send({ childName: 'Timmy', childAge: 10, fatherName: 'Jane Doe' });

    expect(res.status).toBe(201);
    expect(res.body.data.childName).toBe('Timmy');
  });

  it('rejects updating a profile that belongs to another parent', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/v1/user/child-profiles/child-1')
      .set(userAuthHeader(2))
      .send({ childName: 'Someone Else\'s Kid' });

    expect(res.status).toBe(400);
    expect(prismaMock.childProfile.update).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/academies/:id/announcements', () => {
  it('returns announcements for an active academy without requiring auth', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.announcement.findMany.mockResolvedValue([
      { id: 'ann-1', academyId: 'academy-1', content: 'Practice moved to 6pm', createdAt: new Date() },
    ] as any);

    const res = await request(app).get('/api/v1/user/academies/academy-1/announcements');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('returns 404 for an inactive or missing academy', async () => {
    prismaMock.academy.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/v1/user/academies/academy-404/announcements');

    expect(res.status).toBe(404);
  });
});

describe('GET /api/v1/user/students/:studentId/attendance', () => {
  it('returns attendance for a student linked to the requesting parent', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', childProfileId: 'child-1' } as any);
    prismaMock.attendanceRecord.findMany.mockResolvedValue([
      { studentId: 'student-1', date: new Date('2026-08-01'), present: true },
    ] as any);

    const res = await request(app)
      .get('/api/v1/user/students/student-1/attendance')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('rejects a student not linked to the requesting parent', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/user/students/student-1/attendance')
      .set(userAuthHeader(2));

    expect(res.status).toBe(400);
    expect(prismaMock.attendanceRecord.findMany).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/students/:studentId/certificates', () => {
  it('rejects a student not linked to the requesting parent', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .get('/api/v1/user/students/student-1/certificates')
      .set(userAuthHeader(2));

    expect(res.status).toBe(400);
    expect(prismaMock.certificate.findMany).not.toHaveBeenCalled();
  });
});

describe('POST /api/v1/user/enrollments', () => {
  it('enrolls a child into an active academy as a pending request', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.student.findFirst.mockResolvedValue(null);
    prismaMock.student.create.mockResolvedValue({
      id: 'student-1',
      academyId: 'academy-1',
      childProfileId: 'child-1',
      name: 'Timmy',
      age: 10,
      fatherName: 'Jane Doe',
      fatherContact: '9999999999',
      status: 'pending',
      enrollmentDate: new Date(),
      createdAt: new Date(),
      academy: fakeAcademy(),
    } as any);

    const res = await request(app)
      .post('/api/v1/user/enrollments')
      .set(userAuthHeader(1))
      .send({ childProfileId: 'child-1', academyId: 'academy-1' });

    expect(res.status).toBe(201);
    expect(res.body.data.academyName).toBe('Champions Football Academy');
    expect(res.body.data.status).toBe('pending');
    expect(prismaMock.student.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'pending' }) })
    );
  });

  it('rejects enrolling a child profile that does not belong to the requesting parent', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/enrollments')
      .set(userAuthHeader(1))
      .send({ childProfileId: 'child-1', academyId: 'academy-1' });

    expect(res.status).toBe(400);
    expect(prismaMock.student.create).not.toHaveBeenCalled();
  });

  it('rejects enrolling into an inactive academy', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.academy.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/enrollments')
      .set(userAuthHeader(1))
      .send({ childProfileId: 'child-1', academyId: 'academy-1' });

    expect(res.status).toBe(400);
    expect(prismaMock.student.create).not.toHaveBeenCalled();
  });

  it('rejects a duplicate enrollment at the same academy', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.student.findFirst.mockResolvedValue({ id: 'existing-student' } as any);

    const res = await request(app)
      .post('/api/v1/user/enrollments')
      .set(userAuthHeader(1))
      .send({ childProfileId: 'child-1', academyId: 'academy-1' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already enrolled/i);
  });

  it('re-requests on the same row after a prior withdrawal instead of creating a duplicate', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.academy.findFirst.mockResolvedValue(fakeAcademy() as any);
    prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', status: 'inactive' } as any);
    prismaMock.student.update.mockResolvedValue({
      id: 'student-1',
      academyId: 'academy-1',
      childProfileId: 'child-1',
      name: 'Timmy',
      age: 10,
      fatherName: 'Jane Doe',
      fatherContact: '9999999999',
      status: 'pending',
      enrollmentDate: new Date(),
      createdAt: new Date(),
      academy: fakeAcademy(),
    } as any);

    const res = await request(app)
      .post('/api/v1/user/enrollments')
      .set(userAuthHeader(1))
      .send({ childProfileId: 'child-1', academyId: 'academy-1' });

    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(prismaMock.student.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'student-1' }, data: expect.objectContaining({ status: 'pending' }) })
    );
    expect(prismaMock.student.create).not.toHaveBeenCalled();
  });
});

describe('PATCH /api/v1/user/enrollments/:studentId/withdraw', () => {
  it('requires authentication', async () => {
    const res = await request(app).patch('/api/v1/user/enrollments/student-1/withdraw');
    expect(res.status).toBe(401);
  });

  it('withdraws an active enrollment owned by the requesting parent', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', status: 'active' } as any);
    prismaMock.student.update.mockResolvedValue({
      id: 'student-1',
      academyId: 'academy-1',
      childProfileId: 'child-1',
      name: 'Timmy',
      age: 10,
      fatherName: 'Jane Doe',
      fatherContact: '9999999999',
      status: 'inactive',
      enrollmentDate: new Date(),
      createdAt: new Date(),
      academy: fakeAcademy(),
    } as any);

    const res = await request(app)
      .patch('/api/v1/user/enrollments/student-1/withdraw')
      .set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('inactive');
  });

  it('rejects withdrawing an enrollment that does not belong to the requesting parent', async () => {
    prismaMock.student.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .patch('/api/v1/user/enrollments/student-1/withdraw')
      .set(userAuthHeader(2));

    expect(res.status).toBe(400);
    expect(prismaMock.student.update).not.toHaveBeenCalled();
  });

  it('rejects withdrawing an already-withdrawn enrollment', async () => {
    prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1', status: 'inactive' } as any);

    const res = await request(app)
      .patch('/api/v1/user/enrollments/student-1/withdraw')
      .set(userAuthHeader(1));

    expect(res.status).toBe(400);
    expect(prismaMock.student.update).not.toHaveBeenCalled();
  });
});
