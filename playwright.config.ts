// Beschreibung: Playwright-Konfiguration für zugängliche Setup-UI-Clickpfade.
// Artefakte:    US-000011; UX-000002
// Agent:        QA — 2026-07-30
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  reporter: [['html', { outputFolder: 'testing/playwright-report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    // Lokale QA nutzt den sichtbaren Browser; automatisierte Windows-/CI-Läufe haben keine Desktop-Sitzung.
    headless: process.env['CI'] === 'true',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure'
  }
});
