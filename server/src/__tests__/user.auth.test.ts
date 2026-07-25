import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakeUser(overrides: Partial<any> = {}) {
  return {
    id: 1,
    firstname: 'Jane',
    lastname: 'Doe',
    email: 'jane@example.com',
    contact: '9999999999',
    city: 'Pune',
    dob: '2000-01-01',
    password: 'hashed-password',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/user/auth/register', () => {
  it('creates a new user and returns a token', async () => {
    prismaMock.userInfo.findFirst.mockResolvedValue(null);
    prismaMock.userInfo.create.mockResolvedValue(fakeUser());

    const res = await request(app).post('/api/v1/user/auth/register').send({
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
      contact: '9999999999',
      city: 'Pune',
      dob: '2000-01-01',
      password: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({
      email: 'jane@example.com',
      contact: '9999999999',
    });
    expect(res.body.data.user.password).toBeUndefined();
  });

  it('rejects registration with an email or contact already in use', async () => {
    prismaMock.userInfo.findFirst.mockResolvedValue(fakeUser());

    const res = await request(app).post('/api/v1/user/auth/register').send({
      firstname: 'Jane',
      lastname: 'Doe',
      email: 'jane@example.com',
      contact: '9999999999',
      city: 'Pune',
      dob: '2000-01-01',
      password: 'secret123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(prismaMock.userInfo.create).not.toHaveBeenCalled();
  });

  it('rejects registration with invalid input', async () => {
    const res = await request(app).post('/api/v1/user/auth/register').send({
      firstname: '',
      email: 'not-an-email',
      contact: '123',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/user/auth/login', () => {
  it('logs in with email as the identifier', async () => {
    const password = await bcrypt.hash('secret123', 10);
    prismaMock.userInfo.findFirst.mockResolvedValue(fakeUser({ password }));

    const res = await request(app).post('/api/v1/user/auth/login').send({
      identifier: 'jane@example.com',
      password: 'secret123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('logs in with contact number as the identifier', async () => {
    const password = await bcrypt.hash('secret123', 10);
    prismaMock.userInfo.findFirst.mockResolvedValue(fakeUser({ password }));

    const res = await request(app).post('/api/v1/user/auth/login').send({
      identifier: '9999999999',
      password: 'secret123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects an incorrect password', async () => {
    const password = await bcrypt.hash('secret123', 10);
    prismaMock.userInfo.findFirst.mockResolvedValue(fakeUser({ password }));

    const res = await request(app).post('/api/v1/user/auth/login').send({
      identifier: 'jane@example.com',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects an identifier that does not exist', async () => {
    prismaMock.userInfo.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/user/auth/login').send({
      identifier: 'nobody@example.com',
      password: 'secret123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/user/auth/me', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/v1/user/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/v1/user/auth/me').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(403);
  });

  it('rejects a partner-typed token on a user route', async () => {
    const jwt = require('jsonwebtoken');
    const partnerToken = jwt.sign({ id: 'partner-1', type: 'partner' }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    });

    const res = await request(app).get('/api/v1/user/auth/me').set('Authorization', `Bearer ${partnerToken}`);

    expect(res.status).toBe(403);
  });

  it('returns the authenticated user profile', async () => {
    prismaMock.userInfo.findUnique.mockResolvedValue(fakeUser());

    const res = await request(app).get('/api/v1/user/auth/me').set(userAuthHeader(1));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(1);
  });
});

describe('PUT /api/v1/user/auth/me', () => {
  it('updates the user profile with the provided fields', async () => {
    prismaMock.userInfo.findUnique.mockResolvedValue(fakeUser());
    prismaMock.userInfo.update.mockResolvedValue(fakeUser({ city: 'Mumbai' }));

    const res = await request(app).put('/api/v1/user/auth/me').set(userAuthHeader(1)).send({ city: 'Mumbai' });

    expect(res.status).toBe(200);
    expect(res.body.data.city).toBe('Mumbai');
  });

  it('rejects an invalid email format', async () => {
    const res = await request(app)
      .put('/api/v1/user/auth/me')
      .set(userAuthHeader(1))
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).put('/api/v1/user/auth/me').send({ city: 'Mumbai' });
    expect(res.status).toBe(401);
  });
});
