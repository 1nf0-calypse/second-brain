// Beschreibung: Headed Browserpfade fuer Remote-Setup, Consent und Widerruf.
// Artefakte:    US-000001; US-000007; UX-000003; TP-000006
// Agent:        QA - 2026-08-13
import { expect, test } from '@playwright/test';
import { RemoteConsentPage } from './pages/remote-consent.page.js';

test('remote providers expose prerequisites without a credential input', async ({ page }) => {
  const consent = new RemoteConsentPage(page);
  await consent.goto();
  await expect(page.getByText(/workspace-managed remote MCP connection/)).toBeVisible();
  await page.getByTestId('remote-provider').selectOption('mistral');
  await expect(page.getByText(/connector managed in your Mistral workspace/)).toBeVisible();
  await expect(page.locator('input[type="password"]')).toHaveCount(0);
});

test('scope mismatch stays disconnected with explicit expected and found scopes', async ({ page }) => {
  const consent = new RemoteConsentPage(page);
  await consent.goto();
  await consent.connect('https://broad.example/mcp');
  await expect(page.getByTestId('remote-status')).toContainText('Expected scopes: read:notes, consent:once');
  await expect(page.getByTestId('remote-status')).toContainText('Found scopes: read:notes');
  await expect(page.getByTestId('disconnect-provider')).toBeDisabled();
});

test('review shows exact payload and permits precisely one confirmed transfer', async ({ page }) => {
  const consent = new RemoteConsentPage(page);
  await consent.goto();
  await consent.connect();
  await consent.fillReview();
  await expect(page.getByText('Purpose: User-requested remote answer')).toBeVisible();
  await expect(page.getByText('Operation: read:notes')).toBeVisible();
  await expect(page.getByText(/vault, index, attachments, file names, paths, secrets/)).toBeVisible();
  await expect(page.getByTestId('transfer-once')).toBeDisabled();
  await page.getByTestId('reviewed').check();
  await expect(page.getByTestId('transfer-once')).toBeEnabled();
  await page.getByTestId('transfer-once').click();
  await expect(page.getByTestId('remote-status')).toContainText('contains no note content');
  await expect(page.getByTestId('transfer-once')).toBeDisabled();
});

test('payload changes invalidate review and cancel sends nothing', async ({ page }) => {
  const consent = new RemoteConsentPage(page);
  await consent.goto();
  await consent.connect();
  await consent.fillReview();
  await page.getByTestId('reviewed').check();
  await page.getByTestId('remote-excerpt').fill('Changed after review');
  await expect(page.getByTestId('reviewed')).not.toBeChecked();
  await expect(page.getByTestId('transfer-once')).toBeDisabled();
  await page.getByTestId('cancel-transfer').click();
  await expect(page.getByTestId('remote-status')).toContainText('Nothing was sent');
});

test('consent controls remain keyboard accessible at 320 px and disconnect locally', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  const consent = new RemoteConsentPage(page);
  await consent.goto();
  await expect(page.getByTestId('remote-endpoint')).toHaveAccessibleName('User-managed HTTPS endpoint');
  await expect(page.getByTestId('remote-status')).toHaveAttribute('aria-live', 'polite');
  await consent.connect();
  await page.getByTestId('disconnect-provider').click();
  await expect(page.getByTestId('remote-status')).toContainText('Provider disconnected locally');
  await expect(page.getByTestId('remote-status')).toBeFocused();
});
