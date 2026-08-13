// Beschreibung: Native Mutationsansicht für Human-in/out, Vorschau, Budget und Rollback.
// Artefakte:    US-000003; US-000014; UX-000001; ADR-000003; ADR-000004
// Agent:        FE — 2026-08-13
import { ItemView, WorkspaceLeaf } from 'obsidian';
import {
  confirmNoteChange,
  activateAutonomy,
  executeAutonomousMutation,
  getAutonomyStatus,
  pauseAutonomy,
  prepareNoteChange,
  prepareNoteRollback,
  type MutationTransport
} from '../ipc/mutation-client.js';
import type { MutationPreview } from '@second-brain/contracts';

export const MUTATION_VIEW_TYPE = 'second-brain-mutations';

export class MutationView extends ItemView {
  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: MutationTransport,
    private readonly vaultRoot: string
  ) {
    super(leaf);
  }

  public getViewType(): string {
    return MUTATION_VIEW_TYPE;
  }

  public getDisplayText(): string {
    return 'Second Brain Note Change';
  }

  public async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-mutations');
    root.createEl('h1', { text: 'Review note change' });
    root.createEl('p', {
      text: 'Nothing is written until you inspect the preview and confirm it.'
    });

    root.createEl('h2', { text: 'Automation mode' });
    root.createEl('p', { text: 'Human-on and Human-out can create or update Markdown notes automatically: at most 60 changes in one hour. Deletes, moves, and renames are never automatic.' });
    const modeLabel = root.createEl('label', { text: 'Automation mode' });
    const mode = root.createEl('select', { attr: { id: 'second-brain-autonomy-mode', 'aria-label': 'Automation mode' } });
    mode.createEl('option', { value: 'human-on', text: 'Human-on-the-loop' });
    mode.createEl('option', { value: 'human-out', text: 'Human-out-of-the-loop' });
    modeLabel.htmlFor = mode.id;
    const reviewed = root.createEl('input', { attr: { id: 'second-brain-autonomy-reviewed', type: 'checkbox' } });
    const reviewedLabel = root.createEl('label', { text: 'I understand this mode can change my vault without asking for every operation.' });
    reviewedLabel.htmlFor = reviewed.id;
    const activate = root.createEl('button', { text: 'Activate automation' });
    activate.disabled = true;
    const pause = root.createEl('button', { text: 'Pause automation' });
    pause.disabled = true;
    const automatic = root.createEl('button', { text: 'Apply automatic create or update' });
    automatic.hidden = true;
    const autonomyStatus = root.createEl('p', { attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' } });

    const renderAutonomy = (value: Awaited<ReturnType<typeof getAutonomyStatus>>): void => {
      autonomyStatus.textContent = value.message;
      pause.disabled = !value.active;
      automatic.hidden = !value.active;
      automatic.disabled = !value.active;
      activate.disabled = !reviewed.checked;
    };
    const refreshAutonomy = async (): Promise<void> => renderAutonomy(await getAutonomyStatus(this.transport, this.vaultRoot));
    reviewed.addEventListener('change', () => { activate.disabled = !reviewed.checked; });
    activate.addEventListener('click', () => void (async () => {
      activate.disabled = true;
      try {
        renderAutonomy(await activateAutonomy(this.transport, this.vaultRoot, mode.value as 'human-on' | 'human-out'));
        reviewed.checked = false;
      } catch (error: unknown) {
        autonomyStatus.textContent = error instanceof Error ? error.message : 'Automation could not be activated.';
      }
      autonomyStatus.focus();
    })());
    pause.addEventListener('click', () => void (async () => {
      try { renderAutonomy(await pauseAutonomy(this.transport, this.vaultRoot)); } catch (error: unknown) { autonomyStatus.textContent = error instanceof Error ? error.message : 'Automation could not be paused.'; }
      autonomyStatus.focus();
    })());
    void refreshAutonomy().catch(() => { autonomyStatus.textContent = 'Automation status is unavailable. Each change still needs confirmation.'; });

    const pathLabel = root.createEl('label', { text: 'Vault-relative Markdown path' });
    const pathInput = root.createEl('input', {
      type: 'text',
      attr: { 'aria-label': 'Vault-relative Markdown path' }
    });
    pathLabel.htmlFor = 'second-brain-mutation-path';
    pathInput.id = pathLabel.htmlFor;

    const contentLabel = root.createEl('label', { text: 'Complete proposed note content' });
    const contentInput = root.createEl('textarea', {
      attr: { 'aria-label': 'Complete proposed note content', rows: '12' }
    });
    contentLabel.htmlFor = 'second-brain-mutation-content';
    contentInput.id = contentLabel.htmlFor;

    const prepare = root.createEl('button', { text: 'Prepare read-only preview' });
    const previewHeading = root.createEl('h2', { text: 'Preview' });
    previewHeading.hidden = true;
    const diff = root.createEl('pre', {
      cls: 'second-brain-mutation-diff',
      attr: { 'aria-label': 'Change preview' }
    });
    diff.hidden = true;
    const confirm = root.createEl('button', { text: 'Confirm this exact change' });
    confirm.disabled = true;
    confirm.hidden = true;
    const rollback = root.createEl('button', { text: 'Prepare rollback' });
    rollback.hidden = true;
    const status = root.createEl('p', {
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });

    let currentPreview: MutationPreview | null = null;
    let auditId: string | null = null;
    const showPreview = (preview: MutationPreview): void => {
      currentPreview = preview;
      previewHeading.hidden = false;
      diff.hidden = false;
      diff.textContent = preview.diff;
      confirm.hidden = false;
      confirm.disabled = false;
      confirm.textContent = preview.action === 'rollback'
        ? 'Confirm this exact rollback'
        : 'Confirm this exact change';
      status.textContent = `Read-only ${preview.action} preview ready for ${preview.relativePath}. Expires ${new Date(preview.expiresAt).toLocaleTimeString()}.`;
      status.focus();
    };
    const clearPreview = (): void => {
      currentPreview = null;
      confirm.disabled = true;
      confirm.hidden = true;
      diff.hidden = true;
      previewHeading.hidden = true;
    };
    const run = async (operation: () => Promise<void>): Promise<void> => {
      prepare.disabled = true;
      confirm.disabled = true;
      rollback.disabled = true;
      try {
        await operation();
      } catch (error: unknown) {
        clearPreview();
        status.textContent = error instanceof Error ? error.message : 'The operation failed.';
        status.focus();
      } finally {
        prepare.disabled = false;
        rollback.disabled = false;
      }
    };

    prepare.addEventListener('click', () => void run(async () => {
      clearPreview();
      rollback.hidden = true;
      auditId = null;
      status.textContent = 'Preparing a read-only preview…';
      showPreview(await prepareNoteChange(
        this.transport,
        this.vaultRoot,
        pathInput.value.trim(),
        contentInput.value
      ));
    }));

    automatic.addEventListener('click', () => void run(async () => {
      const result = await executeAutonomousMutation(
        this.transport,
        this.vaultRoot,
        pathInput.value.trim(),
        contentInput.value
      );
      const autonomy = await getAutonomyStatus(this.transport, this.vaultRoot);
      renderAutonomy(autonomy);
      status.textContent = `Automatic ${result.action} completed for ${result.relativePath}. ${autonomy.message}`;
      status.focus();
    }));

    confirm.addEventListener('click', () => void run(async () => {
      if (!currentPreview) return;
      const result = await confirmNoteChange(
        this.transport,
        this.vaultRoot,
        currentPreview.token
      );
      auditId = result.auditId;
      clearPreview();
      rollback.hidden = false;
      status.textContent = `${result.action} confirmed for ${result.relativePath}. Audit ID: ${result.auditId}`;
      status.focus();
    }));

    rollback.addEventListener('click', () => void run(async () => {
      if (!auditId) return;
      rollback.hidden = true;
      showPreview(await prepareNoteRollback(this.transport, this.vaultRoot, auditId));
    }));

    const active = this.app.workspace.getActiveFile();
    if (active) {
      pathInput.value = active.path;
      contentInput.value = await this.app.vault.read(active);
      status.textContent = `Loaded ${active.path}. Edit the proposed content, then prepare a preview.`;
    } else {
      status.textContent = 'Enter a new or existing Markdown path and the complete proposed content.';
    }
  }
}
