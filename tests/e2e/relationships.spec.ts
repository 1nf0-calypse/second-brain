// Beschreibung: Headed Windows-E2E für Relationship-Liste, Fokus, Zoom und Navigation.
// Artefakte:    US-000013; UX-000001
// Agent:        FE — 2026-07-31
import { expect, test } from '@playwright/test';
import { SetupPage } from './pages/setup.page.js';

test('explores explicit relationships by keyboard at narrow 200% layout', async ({ page }) => {
  await page.setViewportSize({ width: 640, height: 800 });
  await new SetupPage(page).goto();
  const refresh = page.getByRole('button', { name: 'Refresh active note' });
  await refresh.focus();
  await page.keyboard.press('Enter');

  await expect(page.getByTestId('relationship-status')).toBeFocused();
  await expect(page.getByTestId('relationship-list').getByRole('listitem')).toHaveCount(4);
  await expect(page.getByText('outgoing wiki-link')).toBeVisible();
  await expect(page.getByText('incoming wiki-link')).toBeVisible();
  await expect(page.getByText('outgoing tag')).toBeVisible();
  await expect(page.getByText('outgoing property')).toBeVisible();

  await page.getByTestId('relationship-list').getByRole('button', { name: 'Open note' }).first().click();
  await expect(page.getByTestId('relationship-status')).toHaveText('Opened Beta.');
  await expect(page.getByTestId('relationship-status')).toBeFocused();
});
