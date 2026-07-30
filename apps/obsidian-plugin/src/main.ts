// Beschreibung: Registriert die native Second-Brain-Setup-View in Obsidian.
// Artefakte:    US-000011; US-000005; UX-000002
// Agent:        FE — 2026-07-30
import { FileSystemAdapter, Plugin } from 'obsidian';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SETUP_VIEW_TYPE, SetupView } from './ui/setup-view.js';
import { NodeSetupTransport } from './ipc/node-setup-transport.js';

declare const __SECOND_BRAIN_SIDECAR_SOURCE__: string;

export default class SecondBrainPlugin extends Plugin {
  /**
   * Registriert View und Ribbon-Aktion.
   * @returns Promise nach Plugin-Initialisierung.
   * @throws Obsidian-Registrierungsfehler.
   * @sideEffect Registriert UI-Elemente im Workspace.
   */
  public async onload(): Promise<void> {
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error('Second Brain requires a local desktop vault.');
    }
    const pluginDirectory = join(
      this.app.vault.adapter.getBasePath(),
      '.obsidian',
      'plugins',
      this.manifest.id
    );
    const sidecarDirectory = join(pluginDirectory, 'sidecar');
    const sidecarEntry = join(
      sidecarDirectory,
      'main.js'
    );
    await mkdir(sidecarDirectory, { recursive: true });
    await writeFile(sidecarEntry, __SECOND_BRAIN_SIDECAR_SOURCE__, 'utf8');
    this.registerView(
      SETUP_VIEW_TYPE,
      (leaf) => new SetupView(leaf, new NodeSetupTransport(sidecarEntry), sidecarEntry)
    );
    this.addRibbonIcon('brain-circuit', 'Set up Second Brain', () => {
      void this.openSetup();
    });
    this.addCommand({
      id: 'open-setup',
      name: 'Open setup',
      callback: () => {
        void this.openSetup();
      }
    });
  }

  /**
   * Öffnet oder fokussiert die Setup-View.
   * @returns Promise nach Aktivierung der View.
   * @throws Obsidian-Workspace-Fehler.
   * @sideEffect Öffnet ein rechtes Workspace-Pane.
   */
  private async openSetup(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(SETUP_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error('No workspace leaf is available for Second Brain setup.');
    }
    await leaf.setViewState({ type: SETUP_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
}
