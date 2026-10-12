import { defineConfig, devices } from "@playwright/test";

const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "tests/e2e",
  // Tests share one database and one admin account, so run serially.
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure", screenshot: "only-on-failure" },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] }, testIgnore: /admin-mobile\.spec\.ts/ },
    { name: "mobile", use: { ...devices["Pixel 7"] }, testMatch: /(public|admin-mobile)\.spec\.ts/ },
  ],
  // Start the production server unless pointed at an existing deployment.
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: "npm run start", url: `${baseURL}/api/health`, reuseExistingServer: !process.env.CI, timeout: 120_000 },
});
