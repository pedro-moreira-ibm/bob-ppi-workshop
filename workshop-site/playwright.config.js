import { defineConfig } from '@playwright/test';
const siteBase = (process.env.SITE_BASE || '').replace(/\/$/, '');
const localUrl = `http://localhost:4321${siteBase}`;
export default defineConfig({
  testDir: './tests',
  use: { baseURL: `${process.env.PREVIEW_URL || localUrl}/`, browserName: 'chromium' },
  webServer: process.env.PREVIEW_URL ? undefined : { command: 'npm run preview -- --port 4321', url: `${localUrl}/`, reuseExistingServer: true, timeout: 180000 },
});
