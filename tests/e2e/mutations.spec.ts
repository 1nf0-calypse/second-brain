// Beschreibung: Playwright-Nachweis für explizite Vorschau, Bestätigung und Rollback.
// Artefakte:    US-000014; UX-000001
// Agent:        QA — 2026-07-31
import { expect, test } from '@playwright/test';
import { SetupPage } from './pages/setup.page.js';

test('requires preview and a separate confirmation before a note change', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await new SetupPage(page).goto();
  const confirm = page.getByTestId('confirm-mutation');
  await expect(confirm).toBeHidden();
  await page.getByTestId('prepare-mutation').click();
  await expect(page.getByTestId('mutation-status')).toContainText('Read-only update preview');
  await expect(page.getByTestId('mutation-diff')).toContainText('- # Alpha');
  await expect(confirm).toBeVisible();
  await expect(confirm).toBeEnabled();
  await confirm.click();
  await expect(page.getByTestId('mutation-status')).toContainText('Audit ID');
  await expect(page.getByTestId('prepare-rollback')).toBeVisible();
});

test('rollback also requires its own visible preview and confirmation', async ({ page }) => {
  await new SetupPage(page).goto();
  await page.getByTestId('prepare-mutation').click();
  await page.getByTestId('confirm-mutation').click();
  await page.getByTestId('prepare-rollback').click();
  await expect(page.getByTestId('mutation-status')).toContainText('Read-only rollback preview');
  await expect(page.getByTestId('mutation-diff')).toContainText('+ # Alpha');
  await expect(page.getByRole('button', { name: 'Confirm this exact rollback' })).toBeVisible();
});

test('invalidates confirmation on conflict and exposes accessible controls', async ({ page }) => {
  await new SetupPage(page).goto();
  await expect(page.getByTestId('mutation-path')).toHaveAccessibleName(
    'Vault-relative Markdown path'
  );
  await expect(page.getByTestId('mutation-content')).toHaveAccessibleName(
    'Complete proposed note content'
  );
  await page.getByTestId('mutation-path').fill('conflict.md');
  await page.getByTestId('prepare-mutation').click();
  await expect(page.getByTestId('mutation-status')).toBeFocused();
  await expect(page.getByTestId('mutation-status')).toContainText('Refresh the preview');
  await expect(page.getByTestId('confirm-mutation')).toBeHidden();
});
