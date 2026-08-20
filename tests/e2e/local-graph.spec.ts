// Beschreibung: Browser-Regression für Begrenzung und Fundstellen im lokalen Graphen.
// Artefakte:    US-000020; UX-000005; RV-000011
// Agent:        QA — 2026-08-20
import { expect, test } from '@playwright/test';
import { LocalGraphPage } from './pages/local-graph.page.js';

test('explains a canvas limit and retains all filtered source locations in the list', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await new LocalGraphPage(page).goto();

  await expect(page.getByTestId('local-graph-canvas-summary')).toHaveText(
    'Graph canvas shows 12 of 13 filtered relationships. The complete set is available in the list below.'
  );
  await expect(page.getByTestId('local-graph-list').getByRole('listitem')).toHaveCount(13);
  await expect(page.getByText('Source: Source.md:1', { exact: true })).toBeVisible();
  await expect(page.getByText('Source: Source.md · status', { exact: true })).toBeVisible();

  await page.getByTestId('property-filter').uncheck();
  await expect(page.getByTestId('local-graph-canvas-summary')).toHaveText(
    'Graph canvas shows all 12 filtered relationships.'
  );
  await expect(page.getByTestId('local-graph-list').getByRole('listitem')).toHaveCount(12);
});
