// Beschreibung: Prüft die Laufzeitvalidierung der Plugin-Schnittstelle für Suche und Lesen.
// Artefakte:    US-000012; ADR-000004
// Agent:        QA — 2026-07-31
import { describe, expect, it, vi } from 'vitest';
import {
  readNote,
  searchVault,
  type SearchTransport
} from '../../apps/obsidian-plugin/src/ipc/search-client.js';

const SEARCH_RESPONSE = {
  query: 'citation',
  semanticAvailable: false,
  message: 'Semantic search is unavailable. Showing full-text results only.',
  results: [{
    relativePath: 'Source.md',
    line: 2,
    snippet: 'A citation.',
    matchType: 'full-text',
    extractionStatus: 'extracted',
    score: -1
  }]
} as const;

/**
 * Erstellt einen kontrollierbaren Search-Transport.
 * @returns Transport mit Vitest-Spies und gültigen Standardantworten.
 * @throws Wirft nicht.
 */
function createTransport(): {
  transport: SearchTransport;
  searchSpy: ReturnType<typeof vi.fn>;
  readSpy: ReturnType<typeof vi.fn>;
} {
  const searchSpy = vi.fn().mockResolvedValue(SEARCH_RESPONSE);
  const readSpy = vi.fn().mockResolvedValue({
      relativePath: 'Source.md',
      content: 'A citation.',
      requestedLine: 2,
      extractionStatus: 'extracted'
    });
  return {
    transport: {
      searchVault: searchSpy,
      readNote: readSpy
    },
    searchSpy,
    readSpy
  };
}

describe('search client', () => {
  it('validiert und liefert eine lokale Suchantwort', async () => {
    const { transport, searchSpy } = createTransport();
    await expect(searchVault(transport, 'C:\\Vault', 'citation')).resolves.toEqual(
      SEARCH_RESPONSE
    );
    expect(searchSpy).toHaveBeenCalledWith(
      'C:\\Vault',
      'citation',
      undefined
    );
  });

  it('lehnt eine vertragswidrige Suchantwort ab', async () => {
    const { transport, searchSpy } = createTransport();
    searchSpy.mockResolvedValue({ results: [] });
    await expect(searchVault(transport, 'C:\\Vault', 'citation')).rejects.toThrow();
  });

  it('validiert Quelleninhalt und leitet Fundzeile sowie Abbruchsignal weiter', async () => {
    const { transport, readSpy } = createTransport();
    const controller = new AbortController();
    await expect(
      readNote(transport, 'C:\\Vault', 'Source.md', 2, controller.signal)
    ).resolves.toMatchObject({ relativePath: 'Source.md', requestedLine: 2 });
    expect(readSpy).toHaveBeenCalledWith(
      'C:\\Vault',
      'Source.md',
      2,
      controller.signal
    );
  });
});
