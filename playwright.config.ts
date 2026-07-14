import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  reporter: "line",
  webServer: {
    command: "npm run start -- -H 127.0.0.1",
    url: "http://127.0.0.1:3000",
    reuseExistingServer: false,
  },
  use: { baseURL: "http://127.0.0.1:3000" },
});
