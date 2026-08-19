// Beschreibung: Headed Clickpfade fuer MCP-first Inbox, Templates und History.
// Artefakte:    US-000017; US-000016; US-000008; UX-000004
// Agent:        QA — 2026-08-15
import { expect, test } from '@playwright/test';
import { ChangesPage } from './pages/changes.page.js';

test('reviews an MCP proposal without manual path or Markdown inputs', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  const changes = new ChangesPage(page);
  await changes.goto();
  await expect(page.getByLabel('Vault-relative Markdown path')).toHaveCount(0);
  await expect(page.getByLabel('Complete proposed note content')).toHaveCount(0);
  await changes.openReview();
  await expect(changes.reviewTitle()).toBeFocused();
  await expect(changes.confirm()).toBeDisabled();
  await expect(page.getByText('These sources may conflict. Review the highlighted passages before deciding.')).toBeVisible();
  await expect(page.getByText('I reviewed the warnings above.')).toBeVisible();
  await changes.warnings().check();
  await changes.confirm().click();
  await expect(changes.status()).toContainText('Confirmed and wrote');
});

test('rejects separately without writing and preserves truthful history states', async ({ page }) => {
  const changes = new ChangesPage(page);
  await changes.goto();
  await changes.openReview();
  await changes.reject().click();
  await page.getByTestId('reject-final').click();
  await expect(changes.status()).toContainText('Nothing was written');
  await changes.openSection('History');
  await expect(page.getByTestId('history-entry')).toContainText('Operation: incomplete · Rollback: blocked');
  await expect(page.getByTestId('history-list')).toContainText('Operation: success · Rollback: available');
  await expect(page.getByTestId('history-list')).toContainText('Operation: rejected · Rollback: not-applicable');
  await expect(page.getByTestId('history-list')).toContainText('Operation: success · Rollback: rolled-back');
});

test('reviews template content before saving a new immutable version', async ({ page }) => {
  const changes = new ChangesPage(page);
  await changes.goto();
  await changes.openSection('Templates');
  await page.getByTestId('new-template').click();
  await page.getByTestId('template-name').fill('Sprint review');
  await page.getByTestId('template-content').fill('# Reviewed template');
  await page.getByTestId('review-template').click();
  await expect(page.getByTestId('template-review')).toHaveText('# Reviewed template');
  await page.getByTestId('save-template').click();
  await expect(page.getByTestId('status')).toContainText('version 1 saved');
});
