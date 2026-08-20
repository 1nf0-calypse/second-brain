// Beschreibung: Registriert native Setup-, Search-, Relationship-, Graph- und Changes-Views in Obsidian.
// Artefakte:    US-000011; US-000012; US-000013; US-000004; US-000017; US-000016; US-000008; UX-000005
// Agent:        FE — 2026-08-20
import { FileSystemAdapter, Plugin } from 'obsidian';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { SETUP_VIEW_TYPE, SetupView } from './ui/setup-view.js';
import { NodeSetupTransport } from './ipc/node-setup-transport.js';
import { SEARCH_VIEW_TYPE, SearchView } from './ui/search-view.js';
import {
  RELATIONSHIP_VIEW_TYPE,
  RelationshipView
} from './ui/relationship-view.js';
import { MUTATION_VIEW_TYPE, MutationView } from './ui/mutation-view.js';
import { LOCAL_GRAPH_VIEW_TYPE, LocalGraphView } from './ui/local-graph-view.js';

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
    const transport = new NodeSetupTransport(sidecarEntry);
    const vaultRoot = this.app.vault.adapter.getBasePath();
    this.registerView(
      SETUP_VIEW_TYPE,
      (leaf) => new SetupView(leaf, transport, sidecarEntry, vaultRoot)
    );
    this.registerView(
      SEARCH_VIEW_TYPE,
      (leaf) => new SearchView(leaf, transport, vaultRoot)
    );
    this.registerView(
      RELATIONSHIP_VIEW_TYPE,
      (leaf) => new RelationshipView(leaf, transport, vaultRoot, () => {
        void this.openLocalGraph();
      })
    );
    this.registerView(
      LOCAL_GRAPH_VIEW_TYPE,
      (leaf) => new LocalGraphView(leaf, transport, vaultRoot)
    );
    this.registerView(
      MUTATION_VIEW_TYPE,
      (leaf) => new MutationView(leaf, transport, vaultRoot)
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
    this.addRibbonIcon('git-fork', 'Explore Second Brain relationships', () => {
      void this.openRelationships();
    });
    this.addCommand({
      id: 'open-relationships',
      name: 'Explore active note relationships',
      callback: () => {
        void this.openRelationships();
      }
    });
    this.addRibbonIcon('git-fork', 'Open local graph', () => {
      void this.openLocalGraph();
    });
    this.addCommand({
      id: 'open-local-graph',
      name: 'Open local graph',
      callback: () => {
        void this.openLocalGraph();
      }
    });
    this.addRibbonIcon('search', 'Search Second Brain', () => {
      void this.openSearch();
    });
    this.addCommand({
      id: 'open-search',
      name: 'Search vault',
      callback: () => {
        void this.openSearch();
      }
    });
    this.addRibbonIcon('file-check-2', 'Review Second Brain changes', () => {
      void this.openMutations();
    });
    this.addCommand({
      id: 'open-mutations',
      name: 'Open Changes and review pending compilations',
      callback: () => {
        void this.openMutations();
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

  /**
   * Öffnet oder fokussiert die lokale Search-View.
   * @returns Promise nach Aktivierung der View.
   * @throws Obsidian-Workspace-Fehler.
   * @sideEffect Öffnet ein rechtes Workspace-Pane.
   */
  private async openSearch(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(SEARCH_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error('No workspace leaf is available for Second Brain search.');
    }
    await leaf.setViewState({ type: SEARCH_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  /**
   * Öffnet oder fokussiert die Relationship-Liste der aktiven Notiz.
   * @returns Promise nach Aktivierung der View.
   * @throws Obsidian-Workspace-Fehler.
   * @sideEffect Öffnet ein rechtes Workspace-Pane.
   */
  private async openRelationships(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(RELATIONSHIP_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error('No workspace leaf is available for Second Brain relationships.');
    }
    await leaf.setViewState({ type: RELATIONSHIP_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  /**
   * Öffnet oder fokussiert die lokale Graphansicht der aktiven Notiz.
   * @returns Promise nach Aktivierung der View.
   * @throws Obsidian-Workspace-Fehler.
   * @sideEffect Öffnet ein rechtes Workspace-Pane.
   */
  private async openLocalGraph(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(LOCAL_GRAPH_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error('No workspace leaf is available for the local graph.');
    }
    await leaf.setViewState({ type: LOCAL_GRAPH_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }

  private async openMutations(): Promise<void> {
    const existing = this.app.workspace.getLeavesOfType(MUTATION_VIEW_TYPE)[0];
    const leaf = existing ?? this.app.workspace.getRightLeaf(false);
    if (!leaf) {
      throw new Error('No workspace leaf is available for Second Brain note changes.');
    }
    await leaf.setViewState({ type: MUTATION_VIEW_TYPE, active: true });
    await this.app.workspace.revealLeaf(leaf);
  }
}
