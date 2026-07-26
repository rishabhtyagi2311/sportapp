import { prismaMock, resetPrismaMock } from './helpers/prismaMock';
import request from 'supertest';
import app from '../app';
import { userAuthHeader } from './helpers/auth';

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({})),
  PutObjectCommand: jest.fn().mockImplementation((input) => ({ input })),
}));

jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn().mockResolvedValue('https://bucket.s3.amazonaws.com/signed-url'),
}));

beforeEach(() => {
  resetPrismaMock();
  process.env.AWS_REGION = 'ap-south-1';
  process.env.AWS_BUCKET_NAME = 'test-bucket';
  process.env.AWS_ACCESS_KEY_ID = 'test-key';
  process.env.AWS_SECRET_ACCESS_KEY = 'test-secret';
});

describe('POST /api/v1/user/storage/presigned-url', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/v1/user/storage/presigned-url').send({ fileName: 'photo.jpg', fileType: 'image/jpeg' });
    expect(res.status).toBe(401);
  });

  it('rejects a request missing fileName/fileType', async () => {
    const res = await request(app)
      .post('/api/v1/user/storage/presigned-url')
      .set(userAuthHeader(1))
      .send({});

    expect(res.status).toBe(400);
  });

  it('returns a presigned upload URL and public URL, keyed under the user\'s HealthLog photo path', async () => {
    prismaMock.userInfo.findUnique.mockResolvedValue({
      id: 1,
      firstname: 'Jane',
      lastname: 'Doe',
    } as any);

    const res = await request(app)
      .post('/api/v1/user/storage/presigned-url')
      .set(userAuthHeader(1))
      .send({ fileName: 'photo.jpg', fileType: 'image/jpeg' });

    expect(res.status).toBe(200);
    expect(res.body.data.uploadUrl).toBe('https://bucket.s3.amazonaws.com/signed-url');
    expect(res.body.data.publicUrl).toContain('user/jane-doe-1/HealthLog/photos/');
    expect(res.body.data.publicUrl).toContain('photo.jpg');
  });
});
