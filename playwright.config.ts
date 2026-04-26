import { defineConfig, devices } from '@playwright/test';

const PORT = 4242;

export default defineConfig({
  testDir: './tests/web',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  workers: 4,
  reporter: [['list'], ['json', { outputFile: '.manifest/test-results.json' }]],
  use: {
    baseURL: `http://localhost:${PORT}`,
    actionTimeout: 5_000,
    navigationTimeout: 10_000,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npx serve dist -p ${PORT} -L`,
    port: PORT,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
