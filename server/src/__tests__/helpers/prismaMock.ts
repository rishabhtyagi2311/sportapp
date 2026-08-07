import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset, DeepMockProxy } from 'jest-mock-extended';
import { clearAllCache } from '../../utils/simpleCache';

// Every service in this codebase reaches for its Prisma client via
// `import { prisma as globalClient } from '.../index'`, so mocking that one
// module intercepts DB access for every route under test — no real
// database needed, and nothing here can touch the developer's dev data.
jest.mock('../../index', () => ({
  __esModule: true,
  prisma: mockDeep<PrismaClient>(),
}));

// eslint-disable-next-line @typescript-eslint/no-var-requires
export const prismaMock = require('../../index').prisma as DeepMockProxy<PrismaClient>;

export function resetPrismaMock() {
  mockReset(prismaMock);
  clearAllCache();
}
