// Beschreibung: Zugängliche Listenansicht für direkte Beziehungen einer Obsidian-Notiz.
// Artefakte:    US-000013; BUG-000004; UX-000001; ADR-000003
// Agent:        FE — 2026-07-31
import { ItemView, WorkspaceLeaf } from 'obsidian';
import {
  getRelationships,
  type RelationshipTransport
} from '../ipc/relationship-client.js';

export const RELATIONSHIP_VIEW_TYPE = 'second-brain-relationships';

// Implementiert: US-000013 — Zugängliche Relationship-Exploration
export class RelationshipView extends ItemView {
  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: RelationshipTransport,
    private readonly vaultRoot: string
  ) {
    super(leaf);
  }

  /** @returns Stabiler Obsidian-View-Typ. @throws Wirft nicht. */
  public getViewType(): string {
    return RELATIONSHIP_VIEW_TYPE;
  }

  /** @returns Sichtbarer View-Name. @throws Wirft nicht. */
  public getDisplayText(): string {
    return 'Second Brain Relationships';
  }

  /**
   * Rendert Steuerung, Live-Status und Relationship-Liste.
   * @returns Promise nach initialem Rendern.
   * @throws Wirft nicht; Ladefehler werden zugänglich dargestellt.
   * @sideEffect Ersetzt den Pane-Inhalt und liest den lokalen Index.
   */
  public async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-relationships');
    root.createEl('h1', { text: 'Relationships' });
    root.createEl('p', {
      text: 'Explicit links, backlinks, tags, and properties. Your vault stays unchanged.'
    });
    const refresh = root.createEl('button', { text: 'Refresh active note' });
    const status = root.createEl('p', {
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });
    const list = root.createEl('ul', {
      cls: 'second-brain-relationship-list',
      attr: { 'aria-label': 'Direct relationships' }
    });
    const load = async (): Promise<void> => {
      const active = this.app.workspace.getActiveFile();
      list.empty();
      if (!active) {
        status.textContent = 'Open a note, then refresh this view.';
        status.focus();
        return;
      }
      refresh.disabled = true;
      status.textContent = `Updating the local index and relationships for ${active.path}…`;
      try {
        const response = await getRelationships(
          this.transport,
          this.vaultRoot,
          active.path
        );
        if (response.relationships.length === 0) {
          status.textContent = 'No explicit relationships found for this note.';
          status.focus();
          return;
        }
        status.textContent = `${response.relationships.length} direct relationships for ${active.path}.`;
        for (const relationship of response.relationships) {
          const item = list.createEl('li');
          item.createEl('strong', {
            text: `${relationship.direction} ${relationship.type}`
          });
          item.createEl('span', { text: relationship.target.label });
          item.createEl('small', {
            text: `Source: ${relationship.source.relativePath}${
              relationship.source.line ? `:${relationship.source.line}` : ''
            }`
          });
          if (relationship.target.relativePath) {
            const open = item.createEl('button', { text: 'Open note' });
            open.addEventListener('click', () => {
              void this.app.workspace.openLinkText(
                relationship.target.relativePath ?? '',
                active.path,
                true
              );
            });
          }
        }
        status.focus();
      } catch (error: unknown) {
        status.textContent = `${
          error instanceof Error ? error.message : 'Relationships are unavailable.'
        } Try refreshing the active note again.`;
        status.focus();
      } finally {
        refresh.disabled = false;
      }
    };
    refresh.addEventListener('click', () => void load());
    await load();
  }
}
