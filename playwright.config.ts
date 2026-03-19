import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: resolve(__dirname, '.env.test') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  globalTeardown: './tests/global-teardown.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI and locally to absorb transient network blips and editor timing */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: process.env.CI ? [['github'], ['html']] : [['list'], ['html']],
  /* Global test timeout to prevent tests from hanging indefinitely */
  timeout: 60_000,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: 'http://localhost:5173',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',

    /* Disable CSS animations so dialog/modal transitions don't cause element instability */
    reducedMotion: 'reduce',

    /* Navigation timeout */
    navigationTimeout: 30_000,

    /* Action timeout */
    actionTimeout: 10_000
  },

  expect: {
    timeout: 5_000
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup projects - run first to create auth states
    {
      name: 'setup',
      testMatch: /.*auth\.setup\.ts/
    },
    {
      name: 'anon-setup',
      testMatch: /.*anon\.setup\.ts/
    },

    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/user.json'
      },
      dependencies: ['setup', 'anon-setup']
    }

    // Firefox and WebKit are omitted on CI to keep the suite fast.
    // Run locally with: npx playwright test --project=firefox --project=webkit
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: 'tests/.auth/user.json' },
    //   dependencies: ['setup', 'anon-setup']
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: 'tests/.auth/user.json' },
    //   dependencies: ['setup', 'anon-setup']
    // }

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    /* Ensure server shuts down even if tests fail */
    stdout: 'pipe',
    stderr: 'pipe',
    env: {
      DISABLE_RATE_LIMITING: 'true'
    }
  },

  /* Global timeout for the entire test run to prevent infinite hangs */
  globalTimeout: process.env.CI ? 15 * 60 * 1000 : undefined // 15 minutes in CI
});
