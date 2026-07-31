// Beschreibung: Lokaler Kindprozess-Transport mit operationsspezifischen Zeitlimits.
// Artefakte:    US-000011; US-000005; US-000012; BUG-000003; ADR-000001
// Agent:        BE — 2026-07-31
import { execFile } from 'node:child_process';
import {
  CONTRACT_VERSION,
  ErrorResponseSchema
} from '@second-brain/contracts';
import type { SetupTransport } from './setup-client.js';
import type { SearchTransport } from './search-client.js';

const CONNECTION_TIMEOUT_MS = 5_000;
const SEARCH_TIMEOUT_MS = 10_000;
const INDEX_TIMEOUT_MS = 60_000;

export class NodeSetupTransport implements SetupTransport, SearchTransport {
  public constructor(
    private readonly sidecarEntry: string,
    private readonly nodeExecutable = 'node'
  ) {}

  /**
   * Startet einen einmaligen lokalen Handshake mit hartem Timeout.
   * @param vaultRoot Vom Nutzer freigegebener Vault-Root.
   * @returns Geparste Sidecar-Antwort zur anschließenden Laufzeitvalidierung.
   * @throws Bei Timeout, Prozessfehler oder ungültigem JSON.
   * @sideEffect Startet einen lokalen Node-Prozess; verändert keine Vault-Dateien.
   */
  public testConnection(vaultRoot: string): Promise<unknown> {
    return this.run('--setup-handshake', vaultRoot, {}, CONNECTION_TIMEOUT_MS);
  }

  /**
   * Aktualisiert den lokalen Index mit einem für große Vaults geeigneten Zeitlimit.
   * @param vaultRoot Freigegebener Vault-Root.
   * @returns Ungeprüfte Sidecar-Antwort.
   * @throws Bei Prozess-, Timeout- oder Vertragsfehlern.
   * @sideEffect Startet einen lokalen Prozess und schreibt nur in den abgeleiteten Index.
   */
  public synchronizeIndex(vaultRoot: string): Promise<unknown> {
    return this.run('--sync-index', vaultRoot, {}, INDEX_TIMEOUT_MS);
  }

  /**
   * Baut den lokalen Index atomar mit einem langen Zeitlimit neu auf.
   * @param vaultRoot Freigegebener Vault-Root.
   * @returns Ungeprüfte Sidecar-Antwort.
   * @throws Bei Prozess-, Timeout- oder Vertragsfehlern.
   * @sideEffect Startet einen lokalen Prozess und ersetzt nur den abgeleiteten Index.
   */
  public rebuildIndex(vaultRoot: string): Promise<unknown> {
    return this.run('--rebuild-index', vaultRoot, {}, INDEX_TIMEOUT_MS);
  }

  /**
   * Durchsucht den lokalen Index in einem abbrechbaren Prozess.
   * @param vaultRoot Freigegebener Vault-Root.
   * @param query Suchbegriff oder Phrase.
   * @param signal Optionales Abbruchsignal der UI.
   * @returns Ungeprüfte Sidecar-Antwort.
   * @throws Bei Abbruch, Timeout, Prozess- oder JSON-Fehlern.
   * @sideEffect Startet einen lokalen read-only Prozess.
   */
  public searchVault(
    vaultRoot: string,
    query: string,
    signal?: AbortSignal
  ): Promise<unknown> {
    return this.run(
      '--search',
      vaultRoot,
      { SECOND_BRAIN_SEARCH_QUERY: query },
      SEARCH_TIMEOUT_MS,
      signal
    );
  }

  /**
   * Liest eine zitierte lokale Textnotiz in einem abbrechbaren Prozess.
   * @param vaultRoot Freigegebener Vault-Root.
   * @param relativePath Relativer Quellenpfad.
   * @param line Optionale Fundzeile.
   * @param signal Optionales Abbruchsignal der UI.
   * @returns Ungeprüfte Sidecar-Antwort.
   * @throws Bei Scope-, Abbruch-, Timeout- oder JSON-Fehlern.
   * @sideEffect Startet einen lokalen read-only Prozess.
   */
  public readNote(
    vaultRoot: string,
    relativePath: string,
    line?: number,
    signal?: AbortSignal
  ): Promise<unknown> {
    return this.run(
      '--read-note',
      vaultRoot,
      {
        SECOND_BRAIN_READ_PATH: relativePath,
        ...(line ? { SECOND_BRAIN_READ_LINE: String(line) } : {})
      },
      SEARCH_TIMEOUT_MS,
      signal
    );
  }

  /**
   * Führt eine Sidecar-Operation aus und bewahrt validierte öffentliche Fehlercodes.
   * @param operation CLI-Operation.
   * @param vaultRoot Freigegebener Vault-Root.
   * @param operationEnvironment Operationsspezifische Umgebungswerte.
   * @param timeout Maximale Laufzeit in Millisekunden.
   * @param signal Optionales Abbruchsignal.
   * @returns Geparste Erfolgsantwort.
   * @throws Bei Abbruch, Timeout, validiertem Sidecar-Fehler oder ungültiger Antwort.
   * @sideEffect Startet genau einen lokalen Node-Prozess.
   */
  private run(
    operation: string,
    vaultRoot: string,
    operationEnvironment: Readonly<Record<string, string>>,
    timeout: number,
    signal?: AbortSignal
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      execFile(
        this.nodeExecutable,
        [this.sidecarEntry, operation],
        {
          timeout,
          signal,
          windowsHide: true,
          env: {
            ...process.env,
            SECOND_BRAIN_VAULT_ROOT: vaultRoot,
            SECOND_BRAIN_CONTRACT_VERSION: CONTRACT_VERSION,
            ...operationEnvironment
          }
        },
        (error, stdout, stderr) => {
          if (error) {
            try {
              const response = ErrorResponseSchema.parse(JSON.parse(stderr.trim()));
              reject(new Error(`${response.code}: ${response.message}`));
              return;
            } catch {
              // Nur vollständig validierte Sidecar-Fehler dürfen die UI-Grenze passieren.
            }
            const message =
              error.name === 'AbortError'
                ? 'The operation was cancelled.'
                : error.killed || error.signal
                ? 'The local service did not respond in time.'
                : 'The local service is not available.';
            reject(new Error(message));
            return;
          }
          try {
            resolve(JSON.parse(stdout.trim()) as unknown);
          } catch {
            reject(
              new Error('The local service returned an incompatible response.')
            );
          }
        }
      );
    });
  }
}
