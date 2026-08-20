// Beschreibung: Native, zugängliche lokale Graphansicht mit gleichwertiger Relationship-Liste.
// Artefakte:    US-000004; UX-000005; ADR-000001; ADR-000003
// Agent:        FE — 2026-08-20
import { ItemView, WorkspaceLeaf } from 'obsidian';
import {
  getLocalGraph,
  type LocalGraphTransport
} from '../ipc/local-graph-client.js';
import type { LocalGraphResponse, Relationship } from '@second-brain/contracts';

export const LOCAL_GRAPH_VIEW_TYPE = 'second-brain-local-graph';

type RelationshipFilter = 'wiki-link' | 'backlink' | 'tag' | 'property';
const MAX_CANVAS_RELATIONSHIPS = 12;

/** Implementiert: US-000004 — lokale, rein lesende Graph-Exploration. */
export class LocalGraphView extends ItemView {
  private response: LocalGraphResponse | null = null;
  private readonly filters: Record<RelationshipFilter, boolean> = {
    'wiki-link': true,
    backlink: true,
    tag: true,
    property: true
  };
  private list!: HTMLElement;
  private canvas!: SVGSVGElement;
  private status!: HTMLElement;
  private detail!: HTMLElement;
  private canvasSummary!: HTMLElement;

  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: LocalGraphTransport,
    private readonly vaultRoot: string
  ) {
    super(leaf);
  }

  /** @returns Stabiler Obsidian-View-Typ. @throws Wirft nicht. */
  public getViewType(): string {
    return LOCAL_GRAPH_VIEW_TYPE;
  }

  /** @returns Sichtbarer View-Name. @throws Wirft nicht. */
  public getDisplayText(): string {
    return 'Local graph';
  }

  /**
   * Rendert Filter, SVG-Übersicht und vollständig bedienbare Relationship-Liste.
   * @returns Promise nach initialer read-only Abfrage.
   * @throws Wirft nicht; Fehler werden als Live-Status dargestellt.
   * @sideEffect Ersetzt den Pane-Inhalt und liest ausschließlich den lokalen Index.
   */
  public async onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-local-graph');
    root.createEl('h1', { text: 'Local graph' });
    root.createEl('p', {
      text: 'Explore explicit links, backlinks, tags, and properties. Your vault stays unchanged.'
    });
    const actions = root.createDiv({ cls: 'second-brain-inline-actions' });
    const refresh = actions.createEl('button', { text: 'Refresh graph' });
    const canvasToggle = actions.createEl('button', { text: 'Hide graph canvas' });
    this.status = root.createEl('p', {
      cls: 'second-brain-state',
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });
    this.renderFilters(root);
    this.detail = root.createDiv({ cls: 'second-brain-local-graph-detail' });
    this.canvas = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.canvas.addClass('second-brain-local-graph-canvas');
    this.canvas.setAttribute('aria-hidden', 'true');
    this.canvas.setAttribute('viewBox', '0 0 640 320');
    root.appendChild(this.canvas);
    this.canvasSummary = root.createEl('p', {
      cls: 'second-brain-local-graph-canvas-summary'
    });
    root.createEl('h2', { text: 'Direct relationships' });
    this.list = root.createEl('ul', {
      cls: 'second-brain-relationship-list',
      attr: { 'aria-label': 'Direct relationships' }
    });
    refresh.addEventListener('click', () => void this.refreshGraph(refresh));
    canvasToggle.addEventListener('click', () => {
      const hidden = this.canvas.hasClass('is-hidden');
      this.canvas.toggleClass('is-hidden', !hidden);
      canvasToggle.textContent = hidden ? 'Hide graph canvas' : 'Show graph canvas';
    });
    await this.refreshGraph(refresh);
  }

  /** Rendert die typisierten Beziehungsfilter. */
  private renderFilters(root: HTMLElement): void {
    const fieldset = root.createEl('fieldset', { cls: 'second-brain-local-graph-filters' });
    fieldset.createEl('legend', { text: 'Relationship types' });
    for (const filter of Object.keys(this.filters) as RelationshipFilter[]) {
      const label = fieldset.createEl('label');
      const input = label.createEl('input', { type: 'checkbox' });
      input.checked = this.filters[filter];
      input.addEventListener('change', () => {
        this.filters[filter] = input.checked;
        this.renderResponse();
      });
      label.createSpan({
        text: filter === 'wiki-link' ? 'Wiki links' : `${filter.charAt(0).toUpperCase()}${filter.slice(1)}s`
      });
    }
    const clear = fieldset.createEl('button', { text: 'Clear filters', type: 'button' });
    clear.addEventListener('click', () => {
      for (const filter of Object.keys(this.filters) as RelationshipFilter[]) {
        this.filters[filter] = true;
      }
      fieldset.querySelectorAll<HTMLInputElement>('input').forEach((input) => {
        input.checked = true;
      });
      this.renderResponse();
    });
  }

  /** Lädt den aktuellen Notizkontext über den lokalen Sidecar-Transport. */
  private async refreshGraph(refresh: HTMLButtonElement): Promise<void> {
    const active = this.app.workspace.getActiveFile();
    if (!active) {
      this.status.textContent = 'Open a note, then refresh this view.';
      this.status.focus();
      return;
    }
    refresh.disabled = true;
    this.status.textContent = `Updating the local graph for ${active.path}…`;
    try {
      this.response = await getLocalGraph(this.transport, this.vaultRoot, active.path);
      this.renderResponse();
      this.status.focus();
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'The local graph is unavailable.';
      this.status.textContent = message.includes('SIDECAR_OFFLINE')
        ? 'The local graph is unavailable while the local service is offline.'
        : `${message} Try refreshing the graph again.`;
      this.status.focus();
    } finally {
      refresh.disabled = false;
    }
  }

  /** Aktualisiert Detailbereich, SVG und Liste aus der zuletzt geladenen Antwort. */
  private renderResponse(): void {
    if (!this.response) {
      return;
    }
    const relationships = this.response.relationships.filter((relationship) => this.isVisible(relationship));
    this.detail.empty();
    this.detail.createEl('h2', { text: this.response.focus.title });
    this.detail.createEl('p', { text: this.response.focus.relativePath });
    this.detail.createEl('p', {
      text: this.response.focus.extractionStatus === 'not_extracted' ? 'Not extracted' : 'Extracted text note'
    });
    const open = this.detail.createEl('button', { text: 'Open note' });
    open.addEventListener('click', () => void this.openNote(this.response?.focus.relativePath ?? ''));
    this.list.empty();
    this.renderCanvas(relationships);
    this.canvasSummary.textContent = relationships.length > MAX_CANVAS_RELATIONSHIPS
      ? `Graph canvas shows ${MAX_CANVAS_RELATIONSHIPS} of ${relationships.length} filtered relationships. The complete set is available in the list below.`
      : `Graph canvas shows all ${relationships.length} filtered relationships.`;
    if (this.response.relationships.length === 0) {
      this.status.textContent = 'No indexed relationships are available for this note yet.';
      return;
    }
    if (relationships.length === 0) {
      this.status.textContent = 'No relationships match these filters.';
      return;
    }
    this.status.textContent = `${relationships.length} direct relationships for ${this.response.focus.relativePath}.`;
    for (const relationship of relationships) {
      this.renderRelationship(relationship);
    }
  }

  /** Rendert die visuelle, ergänzende SVG-Darstellung ohne eigene Interaktion. */
  private renderCanvas(relationships: Relationship[]): void {
    this.canvas.empty();
    const focus = this.response?.focus;
    if (!focus) {
      return;
    }
    this.appendSvg('circle', { cx: '320', cy: '160', r: '36', class: 'second-brain-local-graph-focus' });
    this.appendSvg('text', { x: '320', y: '165', 'text-anchor': 'middle', class: 'second-brain-local-graph-label' }, focus.title);
    relationships.slice(0, MAX_CANVAS_RELATIONSHIPS).forEach((relationship, index) => {
      const angle = (Math.PI * 2 * index) / Math.min(relationships.length, MAX_CANVAS_RELATIONSHIPS);
      const x = 320 + Math.cos(angle) * 210;
      const y = 160 + Math.sin(angle) * 105;
      this.appendSvg('line', { x1: '320', y1: '160', x2: `${x}`, y2: `${y}`, class: 'second-brain-local-graph-edge' });
      this.appendSvg('circle', { cx: `${x}`, cy: `${y}`, r: '24', class: 'second-brain-local-graph-node' });
      this.appendSvg('text', { x: `${x}`, y: `${y + 4}`, 'text-anchor': 'middle', class: 'second-brain-local-graph-label' }, relationship.target.label);
    });
  }

  /** Fügt ein SVG-Element mit optionalem Textinhalt an. */
  private appendSvg(tag: string, attributes: Record<string, string>, text?: string): void {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [name, value] of Object.entries(attributes)) {
      element.setAttribute(name, value);
    }
    element.textContent = text ?? '';
    this.canvas.appendChild(element);
  }

  /** Rendert einen listengleichen, per Tastatur nutzbaren Relationship-Eintrag. */
  private renderRelationship(relationship: Relationship): void {
    const item = this.list.createEl('li');
    item.createEl('strong', { text: `${relationship.direction} ${relationship.type}` });
    item.createEl('span', { text: relationship.target.label });
    item.createEl('small', {
      text: `Source: ${relationship.source.relativePath}${this.formatSourceLocation(relationship)}`
    });
    if (!relationship.target.relativePath) {
      item.createEl('small', { text: 'Unresolved link' });
      return;
    }
    const open = item.createEl('button', { text: 'Open note' });
    open.addEventListener('click', () => void this.openNote(relationship.target.relativePath ?? ''));
  }

  /** Prüft, ob eine Beziehung den aktuell gewählten Filter passiert. */
  private isVisible(relationship: Relationship): boolean {
    if (relationship.type === 'wiki-link') {
      return relationship.direction === 'incoming' ? this.filters.backlink : this.filters['wiki-link'];
    }
    return this.filters[relationship.type];
  }

  /** Formatiert die vorhandene Fundstelle ohne technische Felder im UI zu zeigen. */
  private formatSourceLocation(relationship: Relationship): string {
    if (relationship.source.line) {
      return `:${relationship.source.line}`;
    }
    return relationship.source.property ? ` · ${relationship.source.property}` : '';
  }

  /** Öffnet eine aufgelöste Notiz im aktuellen Workspace-Kontext. */
  private async openNote(relativePath: string): Promise<void> {
    const active = this.app.workspace.getActiveFile();
    await this.app.workspace.openLinkText(relativePath, active?.path ?? '', true);
  }
}
