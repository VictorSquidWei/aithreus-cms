import { defineConfig, devices } from "@playwright/test";

// Runs the dev server (NODE_ENV=development → non-secure cookies work over http on localhost).
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: 2, // dev server is single-worker on Windows; retries absorb occasional ECONNRESET / first-compile contention
  timeout: 90_000,
  expect: { timeout: 15_000 },
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:3100",
    actionTimeout: 15_000,
    navigationTimeout: 30_000,
    trace: "off",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
  ],
  webServer: {
    command: "npm run dev -- -p 3100",
    url: "http://localhost:3100",
    reuseExistingServer: true,
    timeout: 120_000,
    env: { AUTH_SECRET: "test-secret-test-secret-test-secret-0001" },
  },
});
