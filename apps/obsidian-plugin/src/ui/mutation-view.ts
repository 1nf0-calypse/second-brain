// Beschreibung: Changes-Arbeitsbereich fuer Pending Reviews, Templates und History.
// Artefakte:    US-000017; US-000016; US-000008; UX-000004; ADR-000007
// Agent:        FE — 2026-08-15
import { ItemView, Modal, Notice, WorkspaceLeaf } from 'obsidian';
import type { PendingCompilationDetail, PendingCompilationSummary } from '@second-brain/contracts';
import {
  decidePendingCompilation,
  getPendingCompilation,
  getPendingCompilationSummary,
  listPendingCompilations,
  type CompilationInboxTransport
} from '../ipc/compilation-client.js';
import type { TemplateStoreTransport } from '../ipc/template-client.js';
import { renderCompilationReview, type CompilationDecision } from './compilation-review.js';
import { compilationErrorMessage } from './compilation-error.js';
import { renderOperationHistory } from './operation-history.js';
import { renderPendingReviewList } from './pending-review-list.js';
import { PendingReviewPoller } from './pending-review-poller.js';
import { renderTemplateLibrary } from './template-library.js';

export const MUTATION_VIEW_TYPE = 'second-brain-mutations';
type ChangesSection = 'pending' | 'templates' | 'history';

class RejectProposalModal extends Modal {
  public constructor(app: ConstructorParameters<typeof Modal>[0], private readonly decide: () => void) { super(app); }
  public onOpen(): void {
    this.contentEl.empty();
    this.contentEl.createEl('h2', { text: 'Reject proposal' });
    this.contentEl.createEl('p', { text: 'Reject this proposal without writing to the vault?' });
    const actions = this.contentEl.createDiv({ cls: 'second-brain-actions' });
    actions.createEl('button', { text: 'Cancel' }).addEventListener('click', () => this.close());
    const reject = actions.createEl('button', { text: 'Reject proposal', cls: 'mod-warning' });
    reject.addEventListener('click', () => { this.close(); this.decide(); });
    reject.focus();
  }
}

export class MutationView extends ItemView {
  private poller: PendingReviewPoller | null = null;
  private lastSummary: PendingCompilationSummary | null = null;
  private currentSection: ChangesSection = 'pending';
  private content: HTMLElement | null = null;
  private status: HTMLElement | null = null;

  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: CompilationInboxTransport & TemplateStoreTransport,
    private readonly vaultRoot: string
  ) { super(leaf); }

  public getViewType(): string { return MUTATION_VIEW_TYPE; }
  public getDisplayText(): string { return 'Second Brain Changes'; }

  /** Opens the MCP-first inbox without manual target or Markdown entry fields. */
  // Implementiert: US-000017; US-000016; US-000008
  public async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-mutations');
    root.createEl('h1', { text: 'Changes' });
    root.createEl('p', { text: 'Review MCP proposals before anything is written to your vault.' });
    const navigation = root.createDiv({ cls: 'second-brain-changes-navigation', attr: { 'aria-label': 'Changes sections' } });
    for (const [section, label] of [['pending', 'Pending reviews'], ['templates', 'Templates'], ['history', 'History']] as const) {
      const button = navigation.createEl('button', { text: label, attr: { type: 'button' } });
      button.dataset.section = section;
      button.addEventListener('click', () => { void this.showSection(section); });
    }
    this.content = root.createDiv({ cls: 'second-brain-changes-content' });
    this.status = root.createEl('p', { attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' } });
    this.poller = new PendingReviewPoller(
      () => getPendingCompilationSummary(this.transport, this.vaultRoot),
      (summary) => this.receiveSummary(summary),
      (error) => this.announce(error instanceof Error ? `Pending reviews are offline. ${error.message}` : 'Pending reviews are offline.', true)
    );
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
    await this.showSection('pending');
    this.poller.start();
  }

  public onClose(): Promise<void> {
    this.poller?.stop();
    this.poller = null;
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    return Promise.resolve();
  }

  private readonly handleVisibilityChange = (): void => {
    this.poller?.refreshNow();
  };

  private async receiveSummary(summary: PendingCompilationSummary): Promise<void> {
    const isNewRevision = this.lastSummary !== null && summary.revision > this.lastSummary.revision;
    this.lastSummary = summary;
    this.updatePendingLabel(summary.count);
    if (isNewRevision && summary.count > 0) new Notice(`${summary.count} pending Second Brain review${summary.count === 1 ? '' : 's'}.`);
    if (isNewRevision && this.currentSection === 'pending' && !this.content?.querySelector('[data-review-heading]')) await this.showPending(false);
  }

  private updatePendingLabel(count: number): void {
    const button = this.containerEl.querySelector<HTMLButtonElement>('[data-section="pending"]');
    if (button) button.textContent = `Pending reviews (${count})`;
  }

  private async showSection(section: ChangesSection): Promise<void> {
    this.currentSection = section;
    for (const button of Array.from(this.containerEl.querySelectorAll<HTMLButtonElement>('[data-section]'))) {
      button.setAttribute('aria-current', button.dataset.section === section ? 'page' : 'false');
    }
    try {
      if (section === 'pending') await this.showPending(true);
      else if (section === 'templates' && this.content) await renderTemplateLibrary(this.content, this.transport, this.vaultRoot, (message, alert) => this.announce(message, alert));
      else if (this.content) await renderOperationHistory(this.content, this.transport, this.vaultRoot);
      this.announce(`${section === 'pending' ? 'Pending reviews' : section === 'templates' ? 'Templates' : 'History'} loaded.`);
    } catch (error: unknown) { this.renderError(error); }
  }

  private async showPending(focusHeading: boolean): Promise<void> {
    if (!this.content) return;
    this.content.replaceChildren();
    const loading = document.createElement('p');
    loading.textContent = 'Loading pending reviews…';
    this.content.append(loading);
    const list = await listPendingCompilations(this.transport, this.vaultRoot);
    renderPendingReviewList(this.content, list, (pendingId) => { void this.showReview(pendingId); });
    this.updatePendingLabel(list.items.length);
    if (focusHeading) this.content.querySelector<HTMLElement>('h2')?.focus();
  }

  private async showReview(pendingId: string): Promise<void> {
    if (!this.content) return;
    try {
      const detail = await getPendingCompilation(this.transport, this.vaultRoot, pendingId);
      renderCompilationReview(this.content, detail, () => { void this.showPending(true); },
        (decision) => this.requestDecision(detail, decision),
        (value) => { void navigator.clipboard.writeText(value)
          .then(() => this.announce('Recovery request copied.'))
          .catch(() => this.announce('Recovery request could not be copied. Select and copy it manually.', true)); });
      this.content.querySelector<HTMLElement>('[data-review-heading]')?.focus();
      this.announce(`Review loaded for ${detail.targetPath}.`);
    } catch (error: unknown) { this.renderError(error); }
  }

  private requestDecision(detail: PendingCompilationDetail, decision: CompilationDecision): void {
    const execute = (): void => { void this.executeDecision(detail, decision); };
    if (decision === 'reject') new RejectProposalModal(this.app, execute).open();
    else execute();
  }

  private async executeDecision(detail: PendingCompilationDetail, decision: CompilationDecision): Promise<void> {
    try {
      const result = await decidePendingCompilation(this.transport, this.vaultRoot, {
        pendingId: detail.pendingId, revision: detail.revision, decision, decisionToken: detail.decisionToken
      });
      const message = result.state === 'confirmed'
        ? `Confirmed and wrote ${detail.targetPath}. Audit ID: ${result.auditId ?? 'unavailable'}.`
        : result.state === 'rejected'
          ? `Rejected ${detail.targetPath}. Nothing was written.`
          : `${detail.targetPath} finished with state ${result.state}. It was not reported as success.`;
      await this.showPending(false);
      this.announce(message, !['confirmed', 'rejected'].includes(result.state));
    } catch (error: unknown) { this.renderError(error); }
  }

  private renderError(error: unknown): void {
    if (!this.content) return;
    const message = compilationErrorMessage(error);
    this.content.replaceChildren();
    const alert = document.createElement('p');
    alert.setAttribute('role', 'alert');
    alert.textContent = message;
    alert.tabIndex = -1;
    const retry = document.createElement('button');
    retry.type = 'button';
    retry.textContent = 'Refresh current section';
    retry.addEventListener('click', () => { void this.showSection(this.currentSection); });
    this.content.append(alert, retry);
    alert.focus();
    this.announce(message, true);
  }

  private announce(message: string, alert = false): void {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.setAttribute('role', alert ? 'alert' : 'status');
  }
}
