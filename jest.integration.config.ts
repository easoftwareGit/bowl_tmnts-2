import nextJest from "next/jest.js";
import type { Config } from "jest";
import { baseConfig } from "./jest.config";

const createJestConfig = nextJest({ dir: "./" });

export default createJestConfig({
  ...baseConfig,
  testPathIgnorePatterns: ["<rootDir>/node_modules/", "<rootDir>/.next/"],
  testMatch: ["**/*.integration.test.[jt]s?(x)"],
});