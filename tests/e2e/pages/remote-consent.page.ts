// Beschreibung: Page Object fuer Remote-Setup und einmaligen Datenfluss-Consent.
// Artefakte:    US-000001; US-000007; UX-000003
// Agent:        QA - 2026-08-13
import { pathToFileURL } from 'node:url';
import type { Page } from '@playwright/test';

export class RemoteConsentPage {
  public constructor(private readonly page: Page) {}

  public async goto(): Promise<void> {
    await this.page.goto(pathToFileURL(`${process.cwd()}\\tests\\e2e\\fixtures\\setup-harness.html`).toString());
  }

  public async connect(endpoint = 'https://valid.example/mcp'): Promise<void> {
    await this.page.getByTestId('remote-endpoint').fill(endpoint);
    await this.page.getByTestId('inspect-remote').click();
  }

  public async fillReview(): Promise<void> {
    await this.page.getByTestId('vault-root').fill('C:\\synthetic-vault');
    await this.page.getByTestId('remote-source').fill('source_0001');
    await this.page.getByTestId('remote-excerpt').fill('Only this synthetic excerpt may leave the device.');
  }
}
