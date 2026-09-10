import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { baseURL: process.env.PREVIEW_URL || 'http://localhost:4321', browserName: 'chromium' },
  webServer: process.env.PREVIEW_URL ? undefined : { command: 'npm run preview -- --port 4321', url: 'http://localhost:4321', reuseExistingServer: true, timeout: 180000 },
});
