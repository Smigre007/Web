import { defineConfig, devices } from "@playwright/test";

/** Porta dedicada para não colidir com `next dev` na 3000. */
const e2eOrigin =
  process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3001";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: e2eOrigin,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run start:e2e",
    url: e2eOrigin,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
