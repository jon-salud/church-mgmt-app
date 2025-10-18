module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js'],
  transform: { '^.+\\.(t|j)s$': 'ts-jest' },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main.ts'],
};
