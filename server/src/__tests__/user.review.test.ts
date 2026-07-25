import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeChildProfile(overrides: Partial<any> = {}) {
  return { id: 'child-1', parentId: 1, childName: 'Timmy', ...overrides };
}

function fakeReview(overrides: Partial<any> = {}) {
  return {
    id: 'review-1',
    academyId: 'academy-1',
    childProfileId: 'child-1',
    parentId: 1,
    rating: 5,
    title: 'Great academy',
    comment: 'Loved it',
    createdAt: new Date(),
    childProfile: fakeChildProfile(),
    ...overrides,
  };
}

describe('POST /api/v1/user/reviews', () => {
  it('requires authentication', async () => {
    const res = await request(app)
      .post('/api/v1/user/reviews')
      .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Great!' });
    expect(res.status).toBe(401);
  });

  it('creates a review and recomputes the academy rating aggregate', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1' } as any);
    prismaMock.review.create.mockResolvedValue(fakeReview() as any);
    prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 2 } } as any);
    prismaMock.academy.update.mockResolvedValue({} as any);

    const res = await request(app)
      .post('/api/v1/user/reviews')
      .set(userAuthHeader(1))
      .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });

    expect(res.status).toBe(201);
    expect(res.body.data.childName).toBe('Timmy');
    expect(prismaMock.academy.update).toHaveBeenCalledWith({
      where: { id: 'academy-1' },
      data: { averageRating: 4.5, reviewCount: 2 },
    });
  });

  it('rejects a review for a child with no approved enrollment at that academy', async () => {
    prismaMock.$transaction.mockImplementation((cb: any) => cb(prismaMock));
    prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile() as any);
    prismaMock.student.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/reviews')
      .set(userAuthHeader(1))
      .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/enrollment/i);
    expect(prismaMock.review.create).not.toHaveBeenCalled();
  });

  it('rejects a review for a child profile that does not belong to the requesting parent', async () => {
    prismaMock.childProfile.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/v1/user/reviews')
      .set(userAuthHeader(1))
      .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });

    expect(res.status).toBe(400);
    expect(prismaMock.review.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/academies/:id/reviews', () => {
  it('lists reviews for an academy without requiring auth', async () => {
    prismaMock.review.findMany.mockResolvedValue([fakeReview()] as any);

    const res = await request(app).get('/api/v1/user/academies/academy-1/reviews');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});
