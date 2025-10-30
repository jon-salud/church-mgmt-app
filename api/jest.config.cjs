module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    // Use a local wrapper so Jest can resolve ts-jest correctly inside pnpm
    // workspaces where package hoisting can confuse module resolution.
    '^.+\\.ts$': '<rootDir>/test/ts-jest-wrapper.cjs',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main.ts'],
  moduleNameMapper: {
    '^prom-client$': '<rootDir>/test/support/stubs/prom-client',
  },
};
