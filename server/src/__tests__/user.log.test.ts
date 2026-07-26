import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeWorkoutLog(overrides: Partial<any> = {}) {
  return {
    id: 'workout-1',
    userId: 1,
    date: new Date('2026-07-26'),
    type: 'Gym',
    split: 'Chest',
    exercises: [{ name: 'Bench Press', sets: '3', reps: '10' }],
    createdAt: new Date(),
    ...overrides,
  };
}

function fakeNutritionLog(overrides: Partial<any> = {}) {
  return {
    id: 'nutrition-1',
    userId: 1,
    date: new Date('2026-07-26'),
    meals: [{ category: 'Breakfast', time: '08:00', description: 'Oats' }],
    createdAt: new Date(),
    ...overrides,
  };
}

function fakeHealthLog(overrides: Partial<any> = {}) {
  return {
    id: 'health-1',
    userId: 1,
    date: new Date('2026-07-26'),
    weight: '70',
    steps: '8000',
    water: '2',
    energy: 'High',
    sleep: 8,
    motivation: 'High',
    measurements: { chest: '40' },
    photoUrl: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/user/logs/workout', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/logs/workout').send({});
    expect(res.status).toBe(401);
  });

  it('creates a workout log for the authenticated user', async () => {
    prismaMock.workoutLog.create.mockResolvedValue(fakeWorkoutLog() as any);

    const res = await request(app)
      .post('/api/v1/user/logs/workout')
      .set(userAuthHeader(1))
      .send({ date: '2026-07-26', type: 'Gym', split: 'Chest', exercises: [{ name: 'Bench Press', sets: '3', reps: '10' }] });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('workout-1');
    expect(prismaMock.workoutLog.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 1, type: 'Gym' }) })
    );
  });

  it('rejects invalid payloads', async () => {
    const res = await request(app)
      .post('/api/v1/user/logs/workout')
      .set(userAuthHeader(1))
      .send({ date: '2026-07-26', type: 'InvalidType', split: 'Chest', exercises: [] });

    expect(res.status).toBe(400);
    expect(prismaMock.workoutLog.create).not.toHaveBeenCalled();
  });
});

describe('GET /api/v1/user/logs/workout/mine', () => {
  it('requires authentication', async () => {
    const res = await request(app).get('/api/v1/user/logs/workout/mine');
    expect(res.status).toBe(401);
  });

  it('returns only the authenticated user\'s workout logs', async () => {
    prismaMock.workoutLog.findMany.mockResolvedValue([fakeWorkoutLog()] as any);

    const res = await request(app).get('/api/v1/user/logs/workout/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.workoutLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });
});

describe('POST /api/v1/user/logs/nutrition', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/logs/nutrition').send({});
    expect(res.status).toBe(401);
  });

  it('creates a nutrition log for the authenticated user', async () => {
    prismaMock.nutritionLog.create.mockResolvedValue(fakeNutritionLog() as any);

    const res = await request(app)
      .post('/api/v1/user/logs/nutrition')
      .set(userAuthHeader(1))
      .send({ date: '2026-07-26', meals: [{ category: 'Breakfast', time: '08:00', description: 'Oats' }] });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('nutrition-1');
  });
});

describe('GET /api/v1/user/logs/nutrition/mine', () => {
  it('returns only the authenticated user\'s nutrition logs', async () => {
    prismaMock.nutritionLog.findMany.mockResolvedValue([fakeNutritionLog()] as any);

    const res = await request(app).get('/api/v1/user/logs/nutrition/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.nutritionLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });
});

describe('POST /api/v1/user/logs/health', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/logs/health').send({});
    expect(res.status).toBe(401);
  });

  it('creates a health log for the authenticated user, including an optional photo URL', async () => {
    prismaMock.healthLog.create.mockResolvedValue(fakeHealthLog({ photoUrl: 'https://bucket.s3.amazonaws.com/photo.jpg' }) as any);

    const res = await request(app)
      .post('/api/v1/user/logs/health')
      .set(userAuthHeader(1))
      .send({
        date: '2026-07-26',
        weight: '70',
        steps: '8000',
        water: '2',
        energy: 'High',
        sleep: 8,
        motivation: 'High',
        measurements: { chest: '40' },
        photoUrl: 'https://bucket.s3.amazonaws.com/photo.jpg',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.photoUrl).toBe('https://bucket.s3.amazonaws.com/photo.jpg');
  });
});

describe('GET /api/v1/user/logs/health/mine', () => {
  it('returns only the authenticated user\'s health logs', async () => {
    prismaMock.healthLog.findMany.mockResolvedValue([fakeHealthLog()] as any);

    const res = await request(app).get('/api/v1/user/logs/health/mine').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(prismaMock.healthLog.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { userId: 1 } })
    );
  });
});
