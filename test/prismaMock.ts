import { mockReset, type DeepMockProxy } from 'jest-mock-extended';
import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

// Replace the real '@/lib/prisma' module with a fake one for every test.
// Jest hoists (moves) this jest.mock() call above the imports at the top of
// this file, so the mock is registered BEFORE anything imports '@/lib/prisma'.
// Result: the real src/lib/prisma.ts never runs, so no DATABASE_URL check,
// no PrismaPg adapter, and no database connection during tests.
jest.mock('@/lib/prisma', () => {
  // Because jest.mock() is hoisted above the imports, the factory can't use
  // the imported jest-mock-extended functions, so load mockDeep with require().  
  const { mockDeep } = require('jest-mock-extended');

  // mockDeep() creates a fake object where every property and method at any
  // depth is a Jest mock function, e.g. mockPrisma.dataType.findMany().
  // Each test sets what these return, e.g.
  // prismaMock.dataType.findMany.mockResolvedValue([...]).
  const mockPrisma = mockDeep();

  // The fake module must have the same exports as the real src/lib/prisma.ts,
  // which exports the client both ways:
  //   prisma  -> for `import { prisma } from '@/lib/prisma'` (used by routes)
  //   default -> for `import prisma from '@/lib/prisma'` (in case it's ever used)
  // Both point to the SAME mock object, so either import style gets one mock.
  // __esModule: true tells Jest to treat this as an ES module, so named and
  // default imports resolve correctly.
  return { __esModule: true, prisma: mockPrisma, default: mockPrisma };
});
beforeEach(() => {
  mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;