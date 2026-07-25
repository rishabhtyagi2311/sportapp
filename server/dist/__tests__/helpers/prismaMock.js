"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prismaMock = void 0;
exports.resetPrismaMock = resetPrismaMock;
const jest_mock_extended_1 = require("jest-mock-extended");
// Every service in this codebase reaches for its Prisma client via
// `import { prisma as globalClient } from '.../index'`, so mocking that one
// module intercepts DB access for every route under test — no real
// database needed, and nothing here can touch the developer's dev data.
jest.mock('../../index', () => ({
    __esModule: true,
    prisma: (0, jest_mock_extended_1.mockDeep)(),
}));
// eslint-disable-next-line @typescript-eslint/no-var-requires
exports.prismaMock = require('../../index').prisma;
function resetPrismaMock() {
    (0, jest_mock_extended_1.mockReset)(exports.prismaMock);
}
//# sourceMappingURL=prismaMock.js.map