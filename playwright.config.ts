import { defineConfig, devices } from '@playwright/test';
import { OrtoniReportConfig } from 'ortoni-report';
import EnvironmentDetector from './src/config/environment/detector/detector';
import { TIMEOUTS } from './src/config/timeouts/timeout.config';
import BrowserInitFlag from './src/config/browserInitFlag';
import { AuthStorageConstants } from './src/utils/auth/constants/authStorage.constants';

const isCI = EnvironmentDetector.isCI();
const shouldSkipBrowserInit = BrowserInitFlag.shouldSkipBrowserInit();
const storageStatePath = EnvironmentDetector.isCI()
  ? AuthStorageConstants.CI_AUTH_FILE
  : AuthStorageConstants.LOCAL_AUTH_FILE;

// ortoni-report types
type chartType = 'doughnut' | 'pie';

const reportConfig: OrtoniReportConfig = {
  open: process.env.CI ? 'never' : 'always',
  folderPath: 'ortoni-report',
  filename: 'index.html',
  logo: '',
  title: 'Ortoni Test Report',
  showProject: !true,
  projectName: 'Playwright-Auth-Storage-Automation',
  testType: 'e2e',
  authorName: 'Tshifhiwa Sinugo',
  base64Image: false,
  stdIO: false,
  preferredTheme: 'dark',
  chartType: 'doughnut' as chartType,
  meta: {
    project: 'Playwright-Auth-Storage-Automation',
    description: 'Playwright authentication storage state configuration',
    testCycle: process.env.TEST_CYCLE || '1',
    platform: process.env.TEST_PLATFORM || 'Windows',
    environment: process.env.ENV || 'dev',
    version: process.env.APP_VERSION || '1.0.0',
  },
};

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  timeout: TIMEOUTS.test,
  expect: {
    timeout: TIMEOUTS.expect,
  },
  testDir: './tests',
  globalSetup: './src/config/environment/global/globalEnvironmentSetup.ts',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? undefined : 2, // local written number that your machine can support/handle/ without hanging
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: isCI
    ? [['junit', { outputFile: 'results.xml' }], ['dot']]
    : [
        ['html', { open: 'never' }],
        ['junit', { outputFile: 'results.xml' }],
        ['ortoni-report', reportConfig],
        ['dot'],
      ],
  grep:
    typeof process.env.PLAYWRIGHT_GREP === 'string'
      ? new RegExp(process.env.PLAYWRIGHT_GREP)
      : process.env.PLAYWRIGHT_GREP || /.*/,
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    // custom options
    headless: isCI ? true : false,
    trace: isCI ? 'retain-on-failure' : 'off',
    screenshot: isCI ? 'only-on-failure' : 'on',
    video: 'retain-on-failure',
  },

  /* Configure projects for major browsers */
  projects: [
    /*
     * Project configuration with conditional browser setup:
     *
     * 1. When shouldSkipBrowserInit is FALSE (normal mode):
     *    - We include the "setup" project that handles browser initialization
     *    - The "setup" project runs tests matching the *.setup.ts pattern
     *    - The "chromium" project depends on "setup" to ensure proper sequencing
     *    - This ensures authentication is properly established before tests run
     *
     * 2. When shouldSkipBrowserInit is TRUE (performance optimization):
     *    - We completely skip the "setup" project (empty array is spread)
     *    - The "chromium" project has no dependencies (empty dependencies array)
     *    - This optimization is useful for operations that don't need browser context
     *      like crypto or database-only operations
     *
     * In both cases, the "chromium" project uses the authentication state from
     * the file path specified in authStorageFilePath.
     */
    ...(!shouldSkipBrowserInit
      ? [
          {
            name: 'setup',
            use: { ...devices['Desktop Chrome'] },
            testMatch: /.*\.setup\.ts/,
          },
        ]
      : []),
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: storageStatePath,
      },
      dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    },
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'], storageState: authStorageFilePath },
    //   dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'], storageState: authStorageFilePath },
    //   dependencies: shouldSkipBrowserInit ? [] : ['setup'],
    // },

    // {
    //   name: 'chromium',
    //   use: { ...devices['Desktop Chrome'] },
    // },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

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
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
