// Wrapper to locate ts-jest reliably in pnpm workspaces.
// Jest expects a transformer module; calling createTransformer() from ts-jest
// returns the transformer. Using require.resolve helps Node find the package
// even with pnpm's hoisted/virtual store layout.
const tsJestPath = require.resolve('ts-jest');
const tsJest = require(tsJestPath);

module.exports = tsJest.createTransformer({
  // Let ts-jest pick up tsconfig from project root
  tsconfig: '<rootDir>/tsconfig.json',
});
