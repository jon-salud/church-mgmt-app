// Wrapper to locate ts-jest reliably in pnpm workspaces.
// Try a normal require first; if that fails, resolve the package.json and
// require the main entry explicitly. This avoids brittle, versioned paths.
const path = require('path');

let tsJest;
try {
  // Prefer standard resolution
  tsJest = require('ts-jest');
} catch (err) {
  // Fallback: resolve package.json, then require the package main file
  const pkgPath = require.resolve('ts-jest/package.json');
  const pkg = require(pkgPath);
  const pkgDir = path.dirname(pkgPath);
  const mainFile = pkg.main || 'dist/index.js';
  tsJest = require(path.join(pkgDir, mainFile));
}

module.exports = tsJest.createTransformer({
  tsconfig: '<rootDir>/tsconfig.json',
});
