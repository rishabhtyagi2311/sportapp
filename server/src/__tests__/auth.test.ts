import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../app';
import { authHeader } from './helpers/auth';

beforeEach(() => {
  resetPrismaMock();
});

function fakePartner(overrides: Partial<any> = {}) {
  return {
    id: 'partner-1',
    firstName: 'Jane',
    lastName: 'Doe',
    contactNumber: '9999999999',
    password: 'hashed-password',
    email: null,
    city: null,
    dob: null,
    profileImage: null,
    createdAt: new Date(),
    ...overrides,
  };
}

describe('POST /api/v1/partner/auth/register', () => {
  it('creates a new partner and returns a token', async () => {
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(null);
    prismaMock.partnerIdentity.create.mockResolvedValue(fakePartner());

    const res = await request(app).post('/api/v1/partner/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      contactNumber: '9999999999',
      password: 'secret123',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.partner).toMatchObject({
      contactNumber: '9999999999',
      firstName: 'Jane',
    });
    // Password hash must never leak into the API response.
    expect(res.body.data.partner.password).toBeUndefined();
  });

  it('rejects registration with a contact number already in use', async () => {
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());

    const res = await request(app).post('/api/v1/partner/auth/register').send({
      firstName: 'Jane',
      lastName: 'Doe',
      contactNumber: '9999999999',
      password: 'secret123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(prismaMock.partnerIdentity.create).not.toHaveBeenCalled();
  });

  it('rejects registration with invalid input', async () => {
    const res = await request(app).post('/api/v1/partner/auth/register').send({
      firstName: '',
      contactNumber: '123',
      password: '123',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('POST /api/v1/partner/auth/login', () => {
  it('logs in with correct credentials', async () => {
    const password = await bcrypt.hash('secret123', 10);
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner({ password }));

    const res = await request(app).post('/api/v1/partner/auth/login').send({
      contactNumber: '9999999999',
      password: 'secret123',
    });

    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it('rejects an incorrect password', async () => {
    const password = await bcrypt.hash('secret123', 10);
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner({ password }));

    const res = await request(app).post('/api/v1/partner/auth/login').send({
      contactNumber: '9999999999',
      password: 'wrong-password',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('rejects a contact number that does not exist', async () => {
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/v1/partner/auth/login').send({
      contactNumber: '9999999999',
      password: 'secret123',
    });

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/v1/partner/auth/me', () => {
  it('rejects requests with no token', async () => {
    const res = await request(app).get('/api/v1/partner/auth/me');
    expect(res.status).toBe(401);
  });

  it('rejects requests with an invalid token', async () => {
    const res = await request(app).get('/api/v1/partner/auth/me').set('Authorization', 'Bearer garbage');
    expect(res.status).toBe(403);
  });

  it('returns the authenticated partner profile', async () => {
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());

    const res = await request(app).get('/api/v1/partner/auth/me').set(authHeader('partner-1'));

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('partner-1');
  });

  it('rejects a token with no type field (pre-migration legacy token)', async () => {
    const legacyToken = jwt.sign({ id: 'partner-1' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    const res = await request(app).get('/api/v1/partner/auth/me').set('Authorization', `Bearer ${legacyToken}`);

    expect(res.status).toBe(403);
  });

  it('rejects a user-typed token on a partner route', async () => {
    const userToken = jwt.sign({ id: 1, type: 'user' }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    const res = await request(app).get('/api/v1/partner/auth/me').set('Authorization', `Bearer ${userToken}`);

    expect(res.status).toBe(403);
  });
});

describe('PUT /api/v1/partner/auth/me', () => {
  it('updates the partner profile with the provided fields', async () => {
    prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());
    prismaMock.partnerIdentity.update.mockResolvedValue(
      fakePartner({ city: 'Mumbai', email: 'jane@example.com' })
    );

    const res = await request(app)
      .put('/api/v1/partner/auth/me')
      .set(authHeader('partner-1'))
      .send({ city: 'Mumbai', email: 'jane@example.com' });

    expect(res.status).toBe(200);
    expect(res.body.data.city).toBe('Mumbai');
    expect(res.body.data.email).toBe('jane@example.com');
  });

  it('rejects an invalid email format', async () => {
    const res = await request(app)
      .put('/api/v1/partner/auth/me')
      .set(authHeader('partner-1'))
      .send({ email: 'not-an-email' });

    expect(res.status).toBe(400);
  });

  it('requires authentication', async () => {
    const res = await request(app).put('/api/v1/partner/auth/me').send({ city: 'Mumbai' });
    expect(res.status).toBe(401);
  });
});
