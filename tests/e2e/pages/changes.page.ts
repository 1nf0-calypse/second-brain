// Beschreibung: Page Object fuer die sichtbaren Changes-, Template- und History-Clickpfade.
// Artefakte:    TP-000009; US-000017; US-000016; US-000008; UX-000004
// Agent:        QA — 2026-08-15
import type { Locator, Page } from '@playwright/test';
import { pathToFileURL } from 'node:url';

export class ChangesPage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto(pathToFileURL(`${process.cwd()}\\tests\\e2e\\fixtures\\changes-harness.html`).toString());
  }

  public pendingItem(): Locator { return this.page.getByTestId('pending-item'); }
  public reviewTitle(): Locator { return this.page.getByTestId('review-title'); }
  public warnings(): Locator { return this.page.getByTestId('warnings'); }
  public confirm(): Locator { return this.page.getByTestId('confirm'); }
  public reject(): Locator { return this.page.getByTestId('reject'); }
  public status(): Locator { return this.page.getByTestId('status'); }

  public async openReview(): Promise<void> { await this.pendingItem().click(); }
  public async openSection(name: 'Templates' | 'History'): Promise<void> {
    await this.page.getByRole('button', { name }).click();
  }
}
