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
function fakeChildProfile(overrides = {}) {
    return { id: 'child-1', parentId: 1, childName: 'Timmy', ...overrides };
}
function fakeReview(overrides = {}) {
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
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/reviews')
            .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Great!' });
        expect(res.status).toBe(401);
    });
    it('creates a review and recomputes the academy rating aggregate', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile());
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue({ id: 'student-1' });
        prismaMock_1.prismaMock.review.create.mockResolvedValue(fakeReview());
        prismaMock_1.prismaMock.review.aggregate.mockResolvedValue({ _avg: { rating: 4.5 }, _count: { rating: 2 } });
        prismaMock_1.prismaMock.academy.update.mockResolvedValue({});
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/reviews')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });
        expect(res.status).toBe(201);
        expect(res.body.data.childName).toBe('Timmy');
        expect(prismaMock_1.prismaMock.academy.update).toHaveBeenCalledWith({
            where: { id: 'academy-1' },
            data: { averageRating: 4.5, reviewCount: 2 },
        });
    });
    it('rejects a review for a child with no approved enrollment at that academy', async () => {
        prismaMock_1.prismaMock.$transaction.mockImplementation((cb) => cb(prismaMock_1.prismaMock));
        prismaMock_1.prismaMock.childProfile.findFirst.mockResolvedValue(fakeChildProfile());
        prismaMock_1.prismaMock.student.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/reviews')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });
        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/enrollment/i);
        expect(prismaMock_1.prismaMock.review.create).not.toHaveBeenCalled();
    });
    it('rejects a review for a child profile that does not belong to the requesting parent', async () => {
        prismaMock_1.prismaMock.childProfile.findFirst.mockResolvedValue(null);
        const res = await (0, supertest_1.default)(app_1.default)
            .post('/api/v1/user/reviews')
            .set((0, auth_1.userAuthHeader)(1))
            .send({ academyId: 'academy-1', childProfileId: 'child-1', rating: 5, comment: 'Loved it' });
        expect(res.status).toBe(400);
        expect(prismaMock_1.prismaMock.review.create).not.toHaveBeenCalled();
    });
});
describe('GET /api/v1/user/academies/:id/reviews', () => {
    it('lists reviews for an academy without requiring auth', async () => {
        prismaMock_1.prismaMock.review.findMany.mockResolvedValue([fakeReview()]);
        const res = await (0, supertest_1.default)(app_1.default).get('/api/v1/user/academies/academy-1/reviews');
        expect(res.status).toBe(200);
        expect(res.body.data).toHaveLength(1);
    });
});
//# sourceMappingURL=user.review.test.js.map