module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  moduleFileExtensions: ['ts', 'js'],
  transform: {
    '^.+\\.ts$':
      '<rootDir>/../node_modules/.pnpm/ts-jest@29.4.5_@babel+core@7.28.4_@jest+transform@29.7.0_@jest+types@29.6.3_babel-jest@29.7.0_aupsoi5cnvnihldatz7xehudoa/node_modules/ts-jest',
  },
  collectCoverage: true,
  coverageDirectory: '<rootDir>/coverage',
  coverageReporters: ['text', 'lcov'],
  collectCoverageFrom: ['<rootDir>/src/**/*.ts', '!<rootDir>/src/main.ts'],
  moduleNameMapper: {
    '^prom-client$': '<rootDir>/test/support/stubs/prom-client',
  },
};
