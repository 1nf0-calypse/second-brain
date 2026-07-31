// Beschreibung: Zugängliche native Search-View mit Quellen, Degradation und Abbruch.
// Artefakte:    US-000012; UX-000001; ADR-000003
// Agent:        FE — 2026-07-31
import { ItemView, MarkdownView, WorkspaceLeaf } from 'obsidian';
import {
  searchVault,
  type SearchTransport
} from '../ipc/search-client.js';

export const SEARCH_VIEW_TYPE = 'second-brain-search';

// Implementiert: US-000012 — Volltextsuche mit überprüfbaren Quellen
export class SearchView extends ItemView {
  private activeSearch: AbortController | undefined;
  private resultsElement: HTMLElement | undefined;
  private statusElement: HTMLElement | undefined;

  public constructor(
    leaf: WorkspaceLeaf,
    private readonly transport: SearchTransport,
    private readonly vaultRoot: string
  ) {
    super(leaf);
  }

  /** @returns Stabiler Obsidian-View-Typ. @throws Wirft nicht. */
  public getViewType(): string {
    return SEARCH_VIEW_TYPE;
  }

  /** @returns Sichtbarer View-Name. @throws Wirft nicht. */
  public getDisplayText(): string {
    return 'Search Second Brain';
  }

  /**
   * Rendert Suche, Live-Status und Ergebnisliste.
   * @returns Promise nach abgeschlossenem Rendern.
   * @throws Wirft nicht.
   * @sideEffect Ersetzt den Inhalt des Obsidian-Panes.
   */
  public onOpen(): Promise<void> {
    const root = this.containerEl.children[1] as HTMLElement;
    root.empty();
    root.addClass('second-brain-search');
    root.createEl('h1', { text: 'Search Second Brain' });
    const form = root.createEl('form', { cls: 'second-brain-search-form' });
    const label = form.createEl('label', { text: 'Search your vault' });
    const input = form.createEl('input', {
      attr: {
        type: 'search',
        placeholder: 'Search notes, tags, properties, and links',
        'aria-describedby': 'second-brain-search-help'
      }
    });
    input.id = 'second-brain-search-query';
    label.htmlFor = input.id;
    form.createEl('p', {
      text: 'Search stays on this device and never changes your vault files.',
      attr: { id: 'second-brain-search-help' }
    });
    const actions = form.createDiv({ cls: 'second-brain-actions' });
    const searchButton = actions.createEl('button', {
      text: 'Search',
      attr: { type: 'submit' }
    });
    const cancelButton = actions.createEl('button', {
      text: 'Cancel search',
      attr: { type: 'button' }
    });
    cancelButton.disabled = true;
    this.statusElement = root.createEl('p', {
      text: 'Enter a phrase to search the local index.',
      attr: { role: 'status', 'aria-live': 'polite', tabindex: '-1' }
    });
    this.resultsElement = root.createEl('ol', {
      cls: 'second-brain-search-results',
      attr: { 'aria-label': 'Search results' }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      void this.runSearch(input.value, searchButton, cancelButton);
    });
    cancelButton.addEventListener('click', () => {
      this.activeSearch?.abort();
    });
    return Promise.resolve();
  }

  /**
   * Führt eine Suche aus und rendert alle vereinbarten UI-Zustände.
   * @param query Aktueller Eingabewert.
   * @param searchButton Submit-Aktion.
   * @param cancelButton Abbruch-Aktion.
   * @returns Promise nach Ergebnis- oder Fehlerdarstellung.
   * @throws Wirft nicht; Fehler werden als Recovery-Status dargestellt.
   * @sideEffect Startet einen lokalen Prozess und aktualisiert Pane und Fokus.
   */
  private async runSearch(
    query: string,
    searchButton: HTMLButtonElement,
    cancelButton: HTMLButtonElement
  ): Promise<void> {
    const trimmed = query.trim();
    if (!trimmed) {
      this.setStatus('Enter a search phrase before searching.', true);
      return;
    }
    this.activeSearch?.abort();
    const controller = new AbortController();
    this.activeSearch = controller;
    searchButton.disabled = true;
    cancelButton.disabled = false;
    this.setStatus('Searching the local index…');
    this.resultsElement?.empty();
    try {
      const response = await searchVault(
        this.transport,
        this.vaultRoot,
        trimmed,
        controller.signal
      );
      if (response.results.length === 0) {
        this.setStatus(
          'No results found. Try another phrase, clear filters, or check the index status.',
          true
        );
        return;
      }
      this.setStatus(
        `${response.results.length} results. ${response.message}`,
        true
      );
      for (const result of response.results) {
        const item = this.resultsElement?.createEl('li');
        if (!item) {
          continue;
        }
        const source = item.createEl('button', {
          text: `${result.relativePath}${result.line ? `:${result.line}` : ''}`,
          cls: 'second-brain-search-source'
        });
        item.createEl('p', {
          text:
            result.extractionStatus === 'extracted'
              ? result.snippet
              : 'Attachment metadata matched. Content was not extracted.'
        });
        item.createEl('small', {
          text: `Match: ${result.matchType}; extraction: ${result.extractionStatus}`
        });
        source.addEventListener('click', () => {
          void this.openSource(result.relativePath, result.line);
        });
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Search is unavailable.';
      this.setStatus(`${message} Try again or check the local index status.`, true);
    } finally {
      if (this.activeSearch === controller) {
        this.activeSearch = undefined;
      }
      searchButton.disabled = false;
      cancelButton.disabled = true;
    }
  }

  /**
   * Öffnet eine zitierte Notiz und setzt den Editorcursor auf die Fundzeile.
   * @param relativePath Relativer Vault-Pfad aus dem validierten Suchvertrag.
   * @param line Einsbasierte Fundzeile oder null für reine Metadatentreffer.
   * @returns Promise nach Öffnen und optionaler Cursorpositionierung.
   * @throws Obsidian-Workspace-Fehler beim Öffnen der Quelle.
   * @sideEffect Öffnet eine Vault-Datei und verändert die aktive Editorposition.
   */
  private async openSource(relativePath: string, line: number | null): Promise<void> {
    await this.app.workspace.openLinkText(relativePath, '', true);
    if (line === null) {
      return;
    }
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) {
      return;
    }
    const position = { line: Math.max(0, line - 1), ch: 0 };
    view.editor.setCursor(position);
    view.editor.scrollIntoView({ from: position, to: position }, true);
  }

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
