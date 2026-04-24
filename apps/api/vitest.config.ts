import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts"],
    coverage: {
      provider: "v8",
      all: true,
      include: ["src/services/scoring.ts"],
      reporter: ["text", "lcov"],
      statements: 95,
      branches: 95,
      functions: 95,
      lines: 95,
    },
  },
});
