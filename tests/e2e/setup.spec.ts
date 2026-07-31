// Beschreibung: Playwright-Clickpfade für Happy Path, Fehler, A11y und schmales Pane.
// Artefakte:    US-000011; UX-000002
// Agent:        QA — 2026-07-30
import { expect, test } from '@playwright/test';
import { SetupPage } from './pages/setup.page.js';

test('local service setup happy path', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await setup.testConnection('C:\\synthetic-vault');
  await expect(page.getByTestId('setup-status')).toHaveText(
    'Local service ready. Verify the connector separately in Claude Desktop.'
  );
  await expect(page.getByTestId('setup-status')).toBeFocused();
});

test('invalid vault has a concrete recovery message', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await setup.testConnection('invalid');
  await expect(page.getByTestId('setup-status')).toContainText('No files were changed.');
});

test('setup controls have accessible names and a live status', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await expect(page.getByTestId('vault-root')).toHaveAccessibleName('Obsidian vault folder');
  await expect(page.getByTestId('copy')).toHaveAccessibleName('Copy configuration');
  await expect(page.getByTestId('test')).toHaveAccessibleName(
    'Test local service'
  );
  await expect(page.getByTestId('update')).toHaveAccessibleName('Update local index');
  await expect(page.getByTestId('rebuild')).toHaveAccessibleName('Rebuild local index');
  await expect(page.getByTestId('setup-status')).toHaveAttribute('aria-live', 'polite');
});

test('setup explains safe JSON merge and exposes index actions', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await expect(page.getByText(/Do not paste it as a second JSON object/)).toBeVisible();
  await page.getByTestId('vault-root').fill('C:\\synthetic-vault');

  await page.getByTestId('update').click();
  await expect(page.getByTestId('setup-status')).toContainText('0 changed');
  await page.getByTestId('rebuild').click();
  await expect(page.getByTestId('setup-status')).toContainText('Index rebuilt');
  await expect(page.getByTestId('setup-status')).toContainText('Original files unchanged');
});

test('320 px pane keeps both recovery actions visible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const setup = new SetupPage(page);
  await setup.goto();
  await page.getByTestId('vault-root').fill('C:\\synthetic-vault');
  await expect(page.getByTestId('copy')).toBeVisible();
  await expect(page.getByTestId('test')).toBeVisible();
  await expect(page.getByTestId('update')).toBeVisible();
  await expect(page.getByTestId('rebuild')).toBeVisible();
});

test('local search exposes citation, line and degraded semantic status', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await page.getByTestId('search-query').fill('citation');
  await page.getByTestId('search').click();

  await expect(page.getByTestId('search-status')).toContainText(
    'Semantic search is unavailable'
  );
  await expect(page.getByRole('button', { name: 'Alpha.md:3' })).toBeVisible();
  await expect(page.getByText('Match: full-text; extraction: extracted')).toBeVisible();
  await expect(page.getByTestId('search-status')).toBeFocused();
});

test('local search presents accessible empty and no-results recovery states', async ({ page }) => {
  const setup = new SetupPage(page);
  await setup.goto();
  await expect(page.getByTestId('search-query')).toHaveAccessibleName('Search your vault');
  await page.getByTestId('search').click();
  await expect(page.getByTestId('search-status')).toContainText('Enter a search phrase');

  await page.getByTestId('search-query').fill('missing');
  await page.getByTestId('search').click();
  await expect(page.getByTestId('search-status')).toContainText('No results found');
});
