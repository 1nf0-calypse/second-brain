// Beschreibung: Registriert die native Second-Brain-Setup-View in Obsidian.
// Artefakte:    US-000011; US-000005; UX-000002
// Agent:        FE — 2026-07-30
import { FileSystemAdapter, Plugin } from 'obsidian';
import { join } from 'node:path';
import { SETUP_VIEW_TYPE, SetupView } from './ui/setup-view.js';
import { NodeSetupTransport } from './ipc/node-setup-transport.js';

export default class SecondBrainPlugin extends Plugin {
  /**
   * Registriert View und Ribbon-Aktion.
   * @returns Promise nach Plugin-Initialisierung.
   * @throws Obsidian-Registrierungsfehler.
   * @sideEffect Registriert UI-Elemente im Workspace.
   */
  public onload(): void {
    if (!(this.app.vault.adapter instanceof FileSystemAdapter)) {
      throw new Error('Second Brain requires a local desktop vault.');
    }
    const sidecarEntry = join(
      this.app.vault.adapter.getBasePath(),
      '.obsidian',
      'plugins',
      this.manifest.id,
      'sidecar',
      'main.js'
    );
    this.registerView(
      SETUP_VIEW_TYPE,
      (leaf) => new SetupView(leaf, new NodeSetupTransport(sidecarEntry))
    );
    this.addRibbonIcon('brain-circuit', 'Set up Second Brain', () => {
      void this.openSetup();
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
