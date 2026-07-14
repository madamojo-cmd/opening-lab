import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  test: {
    environment: "node",
    include: ["lib/**/*.test.ts", "tests/**/*.test.ts"],
    exclude: ["**/component/**", "**/*.tsx"],
    coverage: { provider: "v8", reporter: ["text", "json-summary"] },
  },
});
