import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * EYAS Remote Sensing - Playwright Config
 * Supports: parallel sharding, multi-browser, Allure + HTML reporting,
   * trace/video/screenshot on failure, geolocation permission for map flows.
   */
export default defineConfig({
    testDir: './tests',
        timeout: 60_000,
        expect: { timeout: 10_000 },
        fullyParallel: true,
            forbidOnly: !!process.env.CI,
            retries: process.env.CI ? 2 : 0,
            workers: process.env.CI ? 4 : '50%',
            reporter: [
              ['list'],
              ['html', { outputFolder: 'reports/html', open: 'never' }],
              ['allure-playwright', { detail: true, outputFolder: 'allure-results' }],
              ['junit', { outputFile: 'reports/junit.xml' }],
            ],
            use: {
    baseURL: process.env.BASE_URL ?? 'http://10.254.192.52',
          trace: 'retain-on-failure',
          screenshot: 'only-on-failure',
          video: 'retain-on-failure',
          actionTimeout: 15_000,
          navigationTimeout: 30_000,
          locale: 'en-US',
          permissions: ['geolocation'],
          ignoreHTTPSErrors: true,
      },
        projects: [
      { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
{ name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
{ name: 'webkit',   use: { ...devices['Desktop Safari']  } },
{ name: 'mobile',   use: { ...devices['Pixel 7'] } },
  ],
        });
