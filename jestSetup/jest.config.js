const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  setupFiles: ["<rootDir>/test/setup-tests.ts"],
  // Add more setup options before each test is run
  // for regular tests, use jest.setup.js - .js for javascript
  // setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // for testing with prisma user jest.setup.ts - .ts for typescript
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  preset: "ts-jest",
  verbose: true,
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
