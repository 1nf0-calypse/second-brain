// Beschreibung: Zugängliche native Setup-View für Claude Desktop und lokalen Indexstatus.
// Artefakte:    US-000011; US-000005; UX-000001; UX-000002
// Agent:        FE — 2026-07-30
import { ItemView, WorkspaceLeaf } from 'obsidian';
import { testClaudeConnection, type SetupTransport } from '../ipc/setup-client.js';
import { createConfigurationPreview } from './presentation.js';

export const SETUP_VIEW_TYPE = 'second-brain-setup';

export class SetupView extends ItemView {
  private statusElement: HTMLElement | undefined;
  private vaultRoot = '';

  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: SetupTransport
  ) {
    super(leaf);
  }

  /** @returns Stabiler Obsidian-View-Typ. @throws Wirft nicht. */
  public getViewType(): string {
    return SETUP_VIEW_TYPE;
  }

  /** @returns Sichtbarer View-Name. @throws Wirft nicht. */
  public getDisplayText(): string {
    return 'Set up Second Brain';
  }

  /**
   * Rendert alle Setup-Zustände mit Tastatur- und Live-Region-Unterstützung.
   * @returns Promise nach abgeschlossenem Rendern.
   * @throws Wirft nicht.
   * @sideEffect Ersetzt den Inhalt des Obsidian-Panes.
   */
  public onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-setup');
    root.createEl('h1', { text: 'Set up Second Brain' });
    root.createEl('p', { text: 'Your vault and index stay on this device.' });

    const label = root.createEl('label', { text: 'Obsidian vault folder' });
    const input = root.createEl('input', {
      attr: { type: 'text', 'aria-describedby': 'second-brain-vault-help' }
    });
    label.htmlFor = 'second-brain-vault';
    input.id = 'second-brain-vault';
    root.createEl('p', {
      text: 'Choose an existing readable vault. No files will be moved or changed.',
      attr: { id: 'second-brain-vault-help' }
    });

    const configuration = root.createEl('pre', {
      text: 'Complete the vault step to generate the local configuration.'
    });
    const actions = root.createDiv({ cls: 'second-brain-actions' });
    const copyButton = actions.createEl('button', { text: 'Copy configuration' });
    const testButton = actions.createEl('button', {
      text: 'Test Claude Desktop connection'
    });
    copyButton.disabled = true;
    testButton.disabled = true;

    this.statusElement = root.createEl('p', {
      text: 'Setup not started.',
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });
    root.createEl('p', {
      text: 'Second Brain does not require an additional LLM API key for this connection.'
    });
    root.createEl('p', {
      text: 'ChatGPT and Mistral are not included in this Sprint 1 setup.'
    });

    input.addEventListener('change', () => {
      this.vaultRoot = input.value.trim();
      const config = createConfigurationPreview(this.vaultRoot);
      configuration.textContent = JSON.stringify(config, null, 2);
      copyButton.disabled = this.vaultRoot.length === 0;
      testButton.disabled = this.vaultRoot.length === 0;
      this.setStatus('Vault selected. Test the local connection to validate it.');
    });
    copyButton.addEventListener('click', () => {
      void navigator.clipboard.writeText(configuration.textContent ?? '').then(() => {
        this.setStatus('Configuration copied. Claude Desktop is not connected yet.');
      });
    });
    testButton.addEventListener('click', () => {
      void this.runConnectionTest(testButton);
    });
    return Promise.resolve();
  }

  /**
   * Führt den Verbindungstest ohne doppelte Übermittlung aus.
   * @param testButton Auslösender Button, der während des Tests gesperrt wird.
   * @returns Promise nach Erfolg oder dargestelltem Fehler.
   * @throws Wirft nicht; Fehler werden als Recovery-Status dargestellt.
   * @sideEffect Ändert Button- und Live-Region-Zustand.
   */
  private async runConnectionTest(testButton: HTMLButtonElement): Promise<void> {
    testButton.disabled = true;
    this.setStatus('Testing Claude Desktop connection…');
    try {
      const result = await testClaudeConnection(this.transport, this.vaultRoot);
      this.setStatus(result.message, true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The local service is not available.';
      this.setStatus(`${message} No files were changed.`, true);
    } finally {
      testButton.disabled = false;
    }
  }

  /**
   * Aktualisiert und fokussiert den angekündigten Zustand.
   * @param message Verbindliche Status- oder Recovery-Microcopy.
   * @param focus Ob der neue Zustand fokussiert wird.
   * @returns Nichts.
   * @throws Wirft nicht.
   * @sideEffect Ändert Text und Fokus im Setup-Pane.
   */
  private setStatus(message: string, focus = false): void {
    if (!this.statusElement) {
      return;
    }
    this.statusElement.textContent = message;
    if (focus) {
      this.statusElement.focus();
    }
  }
}
