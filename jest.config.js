/* eslint-disable @typescript-eslint/no-require-imports */
const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "pages/**/*.{ts,tsx,js,jsx}",
    "!pages/_*.tsx",
    "!**/node_modules/**",
    "!**/vendor/**",
  ],
  coverageReporters: ["text-lcov", "lcov"],
  setupFiles: ["./jest.setup.js"],
  transform: {
    ...tsJestTransformCfg,
  },
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
};
