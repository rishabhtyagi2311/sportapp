"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prismaMock_1 = require("./helpers/prismaMock");
const supertest_1 = __importDefault(require("supertest"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("../app"));
const auth_1 = require("./helpers/auth");
beforeEach(() => {
    (0, prismaMock_1.resetPrismaMock)();
});
function fakePartner(overrides = {}) {
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
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(null);
        prismaMock_1.prismaMock.partnerIdentity.create.mockResolvedValue(fakePartner());
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/register').send({
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
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/register').send({
            firstName: 'Jane',
            lastName: 'Doe',
            contactNumber: '9999999999',
            password: 'secret123',
        });
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(prismaMock_1.prismaMock.partnerIdentity.create).not.toHaveBeenCalled();
    });
    it('rejects registration with invalid input', async () => {
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/register').send({
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
        const password = await bcryptjs_1.default.hash('secret123', 10);
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner({ password }));
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/login').send({
            contactNumber: '9999999999',
            password: 'secret123',
        });
        expect(res.status).toBe(200);
        expect(res.body.data.token).toEqual(expect.any(String));
    });
    it('rejects an incorrect password', async () => {
        const password = await bcryptjs_1.default.hash('secret123', 10);
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner({ password }));
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/login').send({
            contactNumber: '9999999999',
            password: 'wrong-password',
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
    it('rejects a contact number that does not exist', async () => {
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default).post('/api/v1/partner/auth/login').send({
            contactNumber: '9999999999',
            password: 'secret123',
        });
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
    });
});
describe('GET /api/v1/partner/auth/me', () => {
    it('rejects requests with no token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/auth/me');
        expect(res.status).toBe(401);
    });
    it('rejects requests with an invalid token', async () => {
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/auth/me').set('Authorization', 'Bearer garbage');
        expect(res.status).toBe(403);
    });
    it('returns the authenticated partner profile', async () => {
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/auth/me').set((0, auth_1.authHeader)('partner-1'));
        expect(res.status).toBe(200);
        expect(res.body.data.id).toBe('partner-1');
    });
    it('rejects a token with no type field (pre-migration legacy token)', async () => {
        const legacyToken = jsonwebtoken_1.default.sign({ id: 'partner-1' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/auth/me').set('Authorization', `Bearer ${legacyToken}`);
        expect(res.status).toBe(403);
    });
    it('rejects a user-typed token on a partner route', async () => {
        const userToken = jsonwebtoken_1.default.sign({ id: 1, type: 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/partner/auth/me').set('Authorization', `Bearer ${userToken}`);
        expect(res.status).toBe(403);
    });
});
describe('PUT /api/v1/partner/auth/me', () => {
    it('updates the partner profile with the provided fields', async () => {
        prismaMock_1.prismaMock.partnerIdentity.findUnique.mockResolvedValue(fakePartner());
        prismaMock_1.prismaMock.partnerIdentity.update.mockResolvedValue(fakePartner({ city: 'Mumbai', email: 'jane@example.com' }));
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/partner/auth/me')
            .set((0, auth_1.authHeader)('partner-1'))
            .send({ city: 'Mumbai', email: 'jane@example.com' });
        expect(res.status).toBe(200);
        expect(res.body.data.city).toBe('Mumbai');
        expect(res.body.data.email).toBe('jane@example.com');
    });
    it('rejects an invalid email format', async () => {
        const res = await (0, supertest_1.default)(app_1.default)
            .put('/api/v1/partner/auth/me')
            .set((0, auth_1.authHeader)('partner-1'))
            .send({ email: 'not-an-email' });
        expect(res.status).toBe(400);
    });
    it('requires authentication', async () => {
        const res = await (0, supertest_1.default)(app_1.default).put('/api/v1/partner/auth/me').send({ city: 'Mumbai' });
        expect(res.status).toBe(401);
    });
});
//# sourceMappingURL=auth.test.js.map