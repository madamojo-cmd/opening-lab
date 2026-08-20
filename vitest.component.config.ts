import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname) } },
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    environment: "jsdom",
    include: [
      "components/**/*.component.test.{ts,tsx}",
      "tests/component/**/*.component.test.{ts,tsx}",
    ],
  },
});
