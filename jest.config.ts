import type { Config } from 'jest'
import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: './',
})

// Add any custom config to be passed to Jest
const config: Config = {
  // coverageProvider: 'v8',
  testEnvironment: 'jsdom',
  // Add more setup options before each test is run
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],   
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  },  
  moduleNameMapper: {
    // Handle alias
    "^@/(.*)$": "<rootDir>/src/$1",

    // CSS modules (import styles from './x.module.css')
    "^.+\\.module\\.(css|sass|scss)$": "identity-obj-proxy",

    // Non-module CSS imports (optional but recommended)
    "^.+\\.(css|sass|scss)$": "<rootDir>/test/__mocks__/styleMock.ts",
  },  
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config)