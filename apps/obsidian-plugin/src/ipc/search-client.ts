// Beschreibung: Typisierte Plugin-Schnittstelle für lokale Suche und Quellenlesen.
// Artefakte:    US-000012; ADR-000001; ADR-000004
// Agent:        FE — 2026-07-31
import {
  ReadNoteResponseSchema,
  SearchResponseSchema,
  type ReadNoteResponse,
  type SearchResponse
} from '@second-brain/contracts';

export interface SearchTransport {
  searchVault(vaultRoot: string, query: string, signal?: AbortSignal): Promise<unknown>;
  readNote(
    vaultRoot: string,
    relativePath: string,
    line?: number,
    signal?: AbortSignal
  ): Promise<unknown>;
}

/**
 * Führt eine validierte lokale Volltextsuche aus.
 * @param transport Injizierbarer lokaler Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @param query Nutzeranfrage.
 * @param signal Optionales Abbruchsignal.
 * @returns Validierte Treffer mit Quellen.
 * @throws Bei Transport-, Abbruch- oder Vertragsfehlern.
 */
export async function searchVault(
  transport: SearchTransport,
  vaultRoot: string,
  query: string,
  signal?: AbortSignal
): Promise<SearchResponse> {
  return SearchResponseSchema.parse(
    await transport.searchVault(vaultRoot, query, signal)
  );
}

/**
 * Liest eine validierte textbasierte Quelle.
 * @param transport Injizierbarer lokaler Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @param relativePath Relativer Pfad aus einem Suchtreffer.
 * @param line Optionale Fundzeile.
 * @param signal Optionales Abbruchsignal.
 * @returns Validierter Notizinhalt.
 * @throws Bei Scope-, Transport- oder Vertragsfehlern.
 */
export async function readNote(
  transport: SearchTransport,
  vaultRoot: string,
  relativePath: string,
  line?: number,
  signal?: AbortSignal
): Promise<ReadNoteResponse> {
  return ReadNoteResponseSchema.parse(
    await transport.readNote(vaultRoot, relativePath, line, signal)
  );
}
