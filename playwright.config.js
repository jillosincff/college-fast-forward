import { defineConfig, devices } from '@playwright/test';

// Magic Moment Quick Test Matrix
// Runs against the deployed app (APP_BASE_URL) or local dev (fallback).
// Auth is handled by tests/magic-moment/auth.setup.js, which logs each fixture
// account in via the GatorAuth email/password flow and saves storageState.
const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false, // Magic Moment cycles mutate per-user state — run serially
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  timeout: 180_000, // LLM + job-feed calls are slow
  expect: { timeout: 30_000 },
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: 30_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'setup',
      testMatch: /auth\.setup\.js/,
      timeout: 120_000,
    },
    {
      name: 'seed',
      testMatch: /seed\.spec\.js/,
      dependencies: ['setup'],
      use: { storageState: 'tests/.auth/admin.json' },
    },
    {
      name: 'e2e',
      testMatch: /e2e\.spec\.js/,
      dependencies: ['seed'],
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/user.json' },
    },
    {
      name: 'api',
      testMatch: /api\.spec\.js/,
      dependencies: ['seed'],
      use: { ...devices['Desktop Chrome'], storageState: 'tests/.auth/api.json' },
    },
  ],
});