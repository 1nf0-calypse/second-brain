// Beschreibung: Zugängliche native Setup-View für Claude Desktop und lokalen Indexstatus.
// Artefakte:    US-000001; US-000007; UX-000003; BUG-000007; BUG-000008
// Agent:        FE — 2026-08-13
import { ItemView, WorkspaceLeaf } from 'obsidian';
import {
  inspectRemoteProvider,
  revokeRemoteProviderConsent,
  prepareRemoteProviderTransfer,
  confirmRemoteProviderTransfer,
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
    const prerequisite = root.createEl('p');
    const providerPolicy = root.createEl('p');
    const providerSource = root.createEl('a', { text: 'Open current provider setup guidance' });
    providerSource.target = '_blank';
    providerSource.rel = 'noreferrer';
    const updateProviderCopy = () => {
      prerequisite.textContent = provider.value === 'chatgpt'
        ? 'ChatGPT requires a workspace-managed remote MCP connection. Your local server is not connected directly.'
        : 'Mistral uses a connector managed in your Mistral workspace. Second Brain never stores its credential.';
      providerPolicy.textContent = provider.value === 'chatgpt'
        ? 'Plan: Business, Enterprise, or Edu. Provider guidance reviewed 2026-08-12.'
        : 'Plan: Mistral workspace with Connectors. Provider guidance reviewed 2026-08-12.';
      providerSource.href = provider.value === 'chatgpt'
        ? 'https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta'
        : 'https://docs.mistral.ai/studio-api/connectors';
      providerSource.ariaLabel = `Open ${provider.value === 'chatgpt' ? 'ChatGPT' : 'Mistral'} setup guidance outside Second Brain`;
    };
    updateProviderCopy();
    const endpointLabel = root.createEl('label', { text: 'User-managed HTTPS endpoint' });
    const endpoint = root.createEl('input', {
      attr: { id: 'second-brain-provider-endpoint', type: 'url', inputmode: 'url' }
    });
    endpointLabel.htmlFor = endpoint.id;
    const inspectButton = root.createEl('button', { text: 'Inspect remote configuration' });
    inspectButton.disabled = true;
    let connectionVerified = false;
    let updateTransferState = (): void => undefined;
    endpoint.addEventListener('input', () => {
      connectionVerified = false;
      inspectButton.disabled = !endpoint.value.startsWith('https://');
    });
    inspectButton.addEventListener('click', () => {
      const inspectedProvider = provider.value as 'chatgpt' | 'mistral';
      const inspectedEndpoint = endpoint.value;
      void this.runRemoteInspection(inspectButton, inspectedProvider, inspectedEndpoint).then((connected) => {
        connectionVerified = connected && provider.value === inspectedProvider && endpoint.value === inspectedEndpoint;
        revokeButton.disabled = !connectionVerified;
        updateTransferState();
      });
    });
    provider.addEventListener('change', () => {
      connectionVerified = false;
      updateProviderCopy();
      updateTransferState();
    });
    const reviewHeading = root.createEl('h2', { text: 'Review external data', attr: { tabindex: '-1' } });
    root.createEl('p', { text: 'Purpose: User-requested remote answer' });
    root.createEl('p', { text: 'Operation: read:notes' });
    root.createEl('p', { text: 'Data categories: text excerpt and pseudonymous source ID' });
    root.createEl('p', { text: 'Only the text and source IDs shown below can be sent. Your vault, index, attachments, file names, paths, secrets, audit log, and diagnostics are excluded.' });
    root.createEl('p', { text: 'Do not send personal or sensitive information. Second Brain cannot classify your text reliably.' });
    const sourceLabel = root.createEl('label', { text: 'Pseudonymous source ID' });
    const sourceId = root.createEl('input', { attr: { id: 'second-brain-transfer-source', type: 'text', placeholder: 'At least 8 letters, numbers, _ or -' } });
    sourceLabel.htmlFor = sourceId.id;
    const excerptLabel = root.createEl('label', { text: 'Exact text excerpt to send once' });
    const excerpt = root.createEl('textarea', { attr: { id: 'second-brain-transfer-excerpt', rows: '4' } });
    excerptLabel.htmlFor = excerpt.id;
    const reviewConfirmation = root.createDiv({ cls: 'second-brain-consent-confirmation' });
    const reviewed = reviewConfirmation.createEl('input', { attr: { type: 'checkbox', id: 'second-brain-transfer-reviewed' } });
    const reviewedLabel = reviewConfirmation.createEl('label', { text: 'I reviewed the exact data above.' });
    reviewedLabel.htmlFor = reviewed.id;
    const transferButton = root.createEl('button', { text: 'Allow this transfer once' });
    const cancelButton = root.createEl('button', { text: 'Cancel — do not send data' });
    const revokeButton = root.createEl('button', { text: 'Disconnect this provider' });
    revokeButton.disabled = true;
    let latestReceiptId = '';
    let confirmationToken = '';
    transferButton.disabled = true;
    updateTransferState = (): void => {
      transferButton.disabled = !(reviewed.checked && confirmationToken.length > 0 && connectionVerified && this.vaultRoot.length > 0 && sourceId.validity.valid && sourceId.value.length >= 8 && excerpt.value.length > 0);
    };
    const invalidateReview = () => {
      reviewed.checked = false;
      confirmationToken = '';
      updateTransferState();
    };
    sourceId.pattern = '[a-zA-Z0-9_-]{8,128}';
    reviewed.addEventListener('change', () => {
      confirmationToken = '';
      updateTransferState();
      if (!reviewed.checked) return;
      void this.prepareProviderReview(
        provider.value as 'chatgpt' | 'mistral',
        endpoint.value,
        sourceId.value,
        excerpt.value
      ).then((token) => {
        if (!reviewed.checked) return;
        confirmationToken = token;
        updateTransferState();
      });
    });
    endpoint.addEventListener('input', invalidateReview);
    provider.addEventListener('change', invalidateReview);
    sourceId.addEventListener('input', invalidateReview);
    excerpt.addEventListener('input', invalidateReview);
    transferButton.addEventListener('click', () => {
      void this.runOneTimeTransfer(transferButton, revokeButton, (receiptId) => { latestReceiptId = receiptId; }, confirmationToken).finally(() => {
        reviewed.checked = false;
        confirmationToken = '';
        updateTransferState();
      });
    });
    cancelButton.addEventListener('click', () => {
      sourceId.value = '';
      excerpt.value = '';
      reviewed.checked = false;
      confirmationToken = '';
      updateTransferState();
      this.setStatus('Nothing was sent. The review was cancelled.', true);
      reviewHeading.focus();
    });
    revokeButton.addEventListener('click', () => {
      const disconnect = latestReceiptId.length > 0
        ? this.runConsentRevocation(revokeButton, latestReceiptId)
        : Promise.resolve(true);
      void disconnect.then((disconnected) => {
        if (!disconnected) return;
        endpoint.value = '';
        connectionVerified = false;
        inspectButton.disabled = true;
        revokeButton.disabled = true;
        latestReceiptId = '';
        this.setStatus('Provider disconnected locally. Revoke the connector or tunnel credential in your provider workspace separately.', true);
        updateTransferState();
      });
    });

    input.addEventListener('change', () => {
      this.vaultRoot = input.value.trim();
      const config = createConfigurationPreview(this.vaultRoot, this.sidecarEntry);
      configuration.textContent = JSON.stringify(config, null, 2);
      copyButton.disabled = this.vaultRoot.length === 0;
      testButton.disabled = this.vaultRoot.length === 0;
      updateButton.disabled = this.vaultRoot.length === 0;
      rebuildButton.disabled = this.vaultRoot.length === 0;
      updateTransferState();
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
  ): Promise<boolean> {
    button.disabled = true;
    this.setStatus('Inspecting remote configuration…');
    try {
      const result = await inspectRemoteProvider(this.transport, provider, endpoint);
      this.setStatus(`${result.message} Expected scopes: read:notes, consent:once. Found scopes: ${result.scopes.join(', ') || 'none'}. No vault content or credentials were transferred.`, true);
      return result.connected;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The remote configuration is invalid.';
      this.setStatus(`${message} No vault content or credentials were transferred.`, true);
      return false;
    } finally {
      button.disabled = false;
    }
  }

  /** Stores the exact visible payload before the separate one-time confirmation. */
  private async prepareProviderReview(provider: 'chatgpt' | 'mistral', endpoint: string, sourceId: string, text: string): Promise<string> {
    this.setStatus('Preparing the exact data for one-time confirmation…');
    try {
      const preview = await prepareRemoteProviderTransfer(this.transport, this.vaultRoot, endpoint, { provider, purpose: 'User-requested remote answer', operation: 'read:notes', policyVersion: `${provider}-2026-08-12`, excerpts: [{ sourceId, text }] });
      this.setStatus(`Review prepared. This exact data can be confirmed once until ${preview.expiresAt}.`, true);
      return preview.confirmationToken;
    } catch (error: unknown) {
      this.setStatus(`${error instanceof Error ? error.message : 'The data could not be prepared for review.'} Nothing was sent.`, true);
      return '';
    }
  }

  /** Delivers only a previously server-bound review token after the user has checked the review control. */
  private async runOneTimeTransfer(button: HTMLButtonElement, revokeButton: HTMLButtonElement, setPayloadHash: (hash: string) => void, confirmationToken: string): Promise<void> {
    button.disabled = true;
    this.setStatus('Sending the reviewed one-time transfer…');
    try {
      const receipt = await confirmRemoteProviderTransfer(this.transport, this.vaultRoot, confirmationToken);
      setPayloadHash(receipt.receiptId);
      revokeButton.disabled = false;
      this.setStatus(`Transfer completed. Confirmation receipt ${receipt.receiptId} contains no note content. Confirmed at ${receipt.confirmedAt}.`, true);
    } catch (error: unknown) {
      this.setStatus(`${error instanceof Error ? error.message : 'The one-time transfer failed.'} Nothing was sent. Check the provider setup or review the data again.`, true);
    }
  }

  /** Revokes the selected text-free receipt and leaves all remote credentials outside the product. */
  private async runConsentRevocation(button: HTMLButtonElement, payloadHash: string): Promise<boolean> {
    button.disabled = true;
    try {
      await revokeRemoteProviderConsent(this.transport, this.vaultRoot, payloadHash);
      return true;
    } catch (error: unknown) {
      this.setStatus(`${error instanceof Error ? error.message : 'The receipt could not be revoked.'} No remote data was sent.`, true);
      button.disabled = false;
      return false;
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
