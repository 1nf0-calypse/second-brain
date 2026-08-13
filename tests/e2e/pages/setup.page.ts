// Beschreibung: Page Object für den Second-Brain-Setup-Clickpfad.
// Artefakte:    US-000011; UX-000002
// Agent:        QA — 2026-07-30
import { pathToFileURL } from 'node:url';
import type { Page } from '@playwright/test';

export class SetupPage {
  public constructor(private readonly page: Page) {}

  /**
   * Öffnet den isolierten UI-Harness für DOM-, Fokus- und Responsive-Prüfungen.
   * @returns Promise nach Navigation.
   * @throws Playwright-Navigationsfehler.
   */
  public async goto(): Promise<void> {
    const fixture = pathToFileURL(
      `${process.cwd()}\\tests\\e2e\\fixtures\\setup-harness.html`
    ).toString();
    await this.page.goto(fixture);
  }

  /**
   * Startet den Verbindungstest für den automatisch erkannten Vault.
   * @returns Promise nach Klick.
   * @throws Playwright-Interaktionsfehler.
   */
  public async testConnection(): Promise<void> {
    await this.page.getByRole('button', { name: 'Test local service' }).click();
  }
}
