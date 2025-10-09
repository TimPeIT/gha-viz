import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',               // nutzt @vitest/coverage-v8
      reporter: ['text', 'lcov'],   // optional
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,             // statements empfehle ich auch zu setzen
      },
      // optional:
      // all: true,                  // auch nicht-getestete Dateien zählen
      // include: ['src/**/*.{js,ts}'],
      // exclude: ['**/*.test.*', 'node_modules/**']
    },
  },
});