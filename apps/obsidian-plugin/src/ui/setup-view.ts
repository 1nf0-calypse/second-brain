// Beschreibung: Zugängliche native Setup-View für Claude Desktop und lokalen Indexstatus.
// Artefakte:    US-000011; US-000005; UX-000001; UX-000002
// Agent:        FE — 2026-07-30
import { ItemView, WorkspaceLeaf } from 'obsidian';
import {
  inspectRemoteProvider,
  rebuildIndex,
  synchronizeIndex,
  testLocalService,
  type SetupTransport
} from '../ipc/setup-client.js';
import { createConfigurationPreview, formatIndexStatus } from './presentation.js';

export const SETUP_VIEW_TYPE = 'second-brain-setup';

export class SetupView extends ItemView {
  private statusElement: HTMLElement | undefined;
  private vaultRoot = '';

  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: SetupTransport,
    private readonly sidecarEntry: string
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
    root.createEl('p', {
      text: 'Claude Desktop: open Settings → Developer → Edit Config. Merge the shown mcpServers entry into the existing top-level JSON object. Do not paste it as a second JSON object.'
    });
    const actions = root.createDiv({ cls: 'second-brain-actions' });
    const copyButton = actions.createEl('button', { text: 'Copy configuration' });
    const testButton = actions.createEl('button', {
      text: 'Test local service'
    });
    const updateButton = actions.createEl('button', { text: 'Update local index' });
    const rebuildButton = actions.createEl('button', { text: 'Rebuild local index' });
    copyButton.disabled = true;
    testButton.disabled = true;
    updateButton.disabled = true;
    rebuildButton.disabled = true;

    this.statusElement = root.createEl('p', {
      text: 'Setup not started.',
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });
    root.createEl('p', {
      text: 'Second Brain does not require an additional LLM API key for this connection.'
    });
    root.createEl('p', {
      text: 'Remote clients use a user-managed endpoint. Second Brain never requests or stores provider credentials.'
    });
    root.createEl('h2', { text: 'Remote client connection' });
    const providerLabel = root.createEl('label', { text: 'Provider' });
    const provider = root.createEl('select', { attr: { 'aria-label': 'Remote provider' } });
    provider.createEl('option', { text: 'ChatGPT Business, Enterprise, or Edu', value: 'chatgpt' });
    provider.createEl('option', { text: 'Mistral Connector', value: 'mistral' });
    providerLabel.htmlFor = 'second-brain-provider';
    provider.id = 'second-brain-provider';
    const endpointLabel = root.createEl('label', { text: 'User-managed HTTPS endpoint' });
    const endpoint = root.createEl('input', {
      attr: { id: 'second-brain-provider-endpoint', type: 'url', inputmode: 'url' }
    });
    endpointLabel.htmlFor = endpoint.id;
    const inspectButton = root.createEl('button', { text: 'Inspect remote configuration' });
    inspectButton.disabled = true;
    endpoint.addEventListener('input', () => {
      inspectButton.disabled = !endpoint.value.startsWith('https://');
    });
    inspectButton.addEventListener('click', () => {
      void this.runRemoteInspection(inspectButton, provider.value as 'chatgpt' | 'mistral', endpoint.value);
    });

    input.addEventListener('change', () => {
      this.vaultRoot = input.value.trim();
      const config = createConfigurationPreview(this.vaultRoot, this.sidecarEntry);
      configuration.textContent = JSON.stringify(config, null, 2);
      copyButton.disabled = this.vaultRoot.length === 0;
      testButton.disabled = this.vaultRoot.length === 0;
      updateButton.disabled = this.vaultRoot.length === 0;
      rebuildButton.disabled = this.vaultRoot.length === 0;
      this.setStatus('Vault selected. Test the local service, then complete the Claude Desktop steps.');
    });
    copyButton.addEventListener('click', () => {
      void navigator.clipboard.writeText(configuration.textContent ?? '').then(() => {
        this.setStatus('Configuration copied. Claude Desktop is not connected yet.');
      });
    });
    testButton.addEventListener('click', () => {
      void this.runConnectionTest(testButton);
    });
    updateButton.addEventListener('click', () => {
      void this.runIndexAction(updateButton, 'Updating local index…', () =>
        synchronizeIndex(this.transport, this.vaultRoot)
      );
    });
    rebuildButton.addEventListener('click', () => {
      void this.runIndexAction(rebuildButton, 'Rebuilding local index…', () =>
        rebuildIndex(this.transport, this.vaultRoot)
      );
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
    this.setStatus('Testing local service…');
    try {
      const result = await testLocalService(this.transport, this.vaultRoot);
      this.setStatus(
        `${result.message} Local service ready. Verify the connector separately in Claude Desktop.`,
        true
      );
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The local service is not available.';
      this.setStatus(`${message} No files were changed.`, true);
    } finally {
      testButton.disabled = false;
    }
  }

  /** Inspects endpoint scope without collecting a provider credential or sending vault content. */
  private async runRemoteInspection(
    button: HTMLButtonElement,
    provider: 'chatgpt' | 'mistral',
    endpoint: string
  ): Promise<void> {
    button.disabled = true;
    this.setStatus('Inspecting remote configuration…');
    try {
      const result = await inspectRemoteProvider(this.transport, provider, endpoint);
      this.setStatus(`${result.message} No vault content or credentials were transferred.`, true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The remote configuration is invalid.';
      this.setStatus(`${message} No vault content or credentials were transferred.`, true);
    } finally {
      button.disabled = false;
    }
  }

  private async runIndexAction(
    button: HTMLButtonElement,
    pendingMessage: string,
    action: () => Promise<import('@second-brain/contracts').IndexStatus>
  ): Promise<void> {
    button.disabled = true;
    this.setStatus(pendingMessage);
    try {
      this.setStatus(formatIndexStatus(await action()), true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The local index is not available.';
      this.setStatus(`${message} The previous index and original files were preserved.`, true);
    } finally {
      button.disabled = false;
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
