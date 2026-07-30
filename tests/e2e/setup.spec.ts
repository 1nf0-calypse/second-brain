// Beschreibung: Playwright-Clickpfade für Happy Path, Fehler, A11y und schmales Pane.
// Artefakte:    US-000011; UX-000002
// Agent:        QA — 2026-07-30
import { expect, test } from '@playwright/test';
import { SetupPage } from './pages/setup.page.js';

test('Claude Desktop setup happy path', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await setup.testConnection('C:\\synthetic-vault');
  await expect(page.getByRole('status')).toHaveText(
    'Claude Desktop connected with read-only setup access.'
  );
  await expect(page.getByRole('status')).toBeFocused();
});

test('invalid vault has a concrete recovery message', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await setup.testConnection('invalid');
  await expect(page.getByRole('status')).toContainText('No files were changed.');
});

test('setup controls have accessible names and a live status', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await expect(page.getByTestId('vault-root')).toHaveAccessibleName('Obsidian vault folder');
  await expect(page.getByTestId('copy')).toHaveAccessibleName('Copy configuration');
  await expect(page.getByTestId('test')).toHaveAccessibleName(
    'Test Claude Desktop connection'
  );
  await expect(page.getByRole('status')).toHaveAttribute('aria-live', 'polite');
});

test('320 px pane keeps both recovery actions visible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const setup = new SetupPage(page);
  await setup.goto();
  await page.getByTestId('vault-root').fill('C:\\synthetic-vault');
  await expect(page.getByTestId('copy')).toBeVisible();
  await expect(page.getByTestId('test')).toBeVisible();
});
