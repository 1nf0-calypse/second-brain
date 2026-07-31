// Beschreibung: Gemeinsamer read-only Anwendungsservice für lokale Suche und Quellenlesen.
// Artefakte:    US-000012; ADR-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import {
  ReadNoteRequestSchema,
  ReadNoteResponseSchema,
  SearchRequestSchema,
  type ReadNoteResponse,
  type SearchResponse
} from '@second-brain/contracts';
import { LocalIndex } from '../indexing/sqlite-index.js';
import { resolveInsideVault } from '../policy/vault-root.js';

const READABLE_EXTENSIONS = new Set(['.md', '.txt']);

// Implementiert: US-000012 — Volltextsuche mit überprüfbaren Quellen
export class SearchService {
  public constructor(
    private readonly vaultRoot: string,
    private readonly index: LocalIndex
  ) {}

  /**
   * Validiert und führt eine lokale Volltextsuche aus.
   * @param input Ungeprüfte Eingabe von MCP, CLI oder Plugin.
   * @returns Volltexttreffer mit überprüfbaren Quellen.
   * @throws ZodError oder SQLite-Fehler bei ungültiger Anfrage.
   * @sideEffect Liest ausschließlich den lokalen Index.
   */
  public search(input: unknown): SearchResponse {
    const request = SearchRequestSchema.parse(input);
    return this.index.search(request.query, request.limit);
  }

  /**
   * Liest eine explizit angefragte Textnotiz innerhalb des freigegebenen Vaults.
   * @param input Ungeprüfte Quellenanfrage.
   * @returns Inhalt und kanonische relative Quelle.
   * @throws Bei ungültigem Pfad, Scope-Escape oder nicht extrahierbarem Dateityp.
   * @sideEffect Liest genau eine lokale Vault-Datei und verändert sie nicht.
   */
  public async readNote(input: unknown): Promise<ReadNoteResponse> {
    const request = ReadNoteRequestSchema.parse(input);
    const absolutePath = await resolveInsideVault(this.vaultRoot, request.relativePath);
    if (!READABLE_EXTENSIONS.has(extname(absolutePath).toLowerCase())) {
      throw new Error('The requested attachment is not extracted.');
    }
    const content = await readFile(absolutePath, 'utf8');
    return ReadNoteResponseSchema.parse({
      relativePath: request.relativePath,
      content,
      requestedLine: request.line ?? null,
      extractionStatus: 'extracted'
    });
  }
}
