import { defineConfig } from 'vitest/config';

// Return `any` to relax TypeScript checks for flags that may not exist in
// some vitest type bundle versions (threads/isolate). The runtime Vitest
// accepts these flags and they help avoid duplicate module transforms.
export default defineConfig(() => {
  const cfg: any = {
    test: {
      environment: 'node',
      globals: true,
      include: ['test/**/*.spec.ts'],
      setupFiles: ['test/setup-vitest.ts'],
      passWithNoTests: true,
      // Run tests in-process and disable module isolation to reduce duplicate
      // module transforms that can cause Nest DI class-identity mismatches.
      threads: false,
      isolate: false,
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
      },
    },
  };
  return cfg;
});
