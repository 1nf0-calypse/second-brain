// Beschreibung: Page Object für die lokale Graph-Exploration im UI-Harness.
// Artefakte:    US-000020; UX-000005
// Agent:        QA — 2026-08-20
import { pathToFileURL } from 'node:url';
import type { Page } from '@playwright/test';

export class LocalGraphPage {
  public constructor(private readonly page: Page) {}

  /** Öffnet den isolierten Harness für die lokale Graph-Ansicht. */
  public async goto(): Promise<void> {
    const fixture = pathToFileURL(
      `${process.cwd()}\\tests\\e2e\\fixtures\\local-graph-harness.html`
    ).toString();
    await this.page.goto(fixture);
  }
}
