import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  use: { baseURL: 'http://127.0.0.1:5173', browserName: 'chromium' },
  webServer: [
    {
      command: '../scripts/backend',
      url: 'http://127.0.0.1:8000/api/v1/health',
      env: { SIGNSPEAK_ENVIRONMENT: 'test', SIGNSPEAK_DATABASE_URL: 'sqlite:///:memory:' },
    },
    { command: 'npm run dev', url: 'http://127.0.0.1:5173' },
  ],
})
