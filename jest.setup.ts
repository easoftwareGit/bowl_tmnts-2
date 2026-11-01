import '@testing-library/jest-dom'
import type { ReactNode } from 'react'

// next-auth v5 ships as ESM, which Jest can't parse from node_modules.
// Mock it globally; individual tests can override with their own jest.mock().
jest.mock('next-auth/react', () => ({
  __esModule: true,
  SessionProvider: ({ children }: { children: ReactNode }) => children,
  useSession: jest.fn(() => ({
    data: null,
    status: 'unauthenticated',
    update: jest.fn(),
  })),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))