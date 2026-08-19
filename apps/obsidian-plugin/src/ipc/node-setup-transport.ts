// Beschreibung: Lokaler Kindprozess-Transport mit operationsspezifischen Zeitlimits und JSON-stdin.
// Artefakte:    US-000003; US-000011; US-000014; US-000017; BUG-000003; ADR-000001; ADR-000004; ADR-000007
// Agent:        BE — 2026-08-15
import { execFile } from 'node:child_process';
import {
  CONTRACT_VERSION,
  ErrorResponseSchema
} from '@second-brain/contracts';
import type { SetupTransport } from './setup-client.js';
import type { SearchTransport } from './search-client.js';
import type { RelationshipTransport } from './relationship-client.js';
import type { MutationTransport } from './mutation-client.js';
import type { CompilationInboxTransport } from './compilation-client.js';
import type { TemplateStoreTransport } from './template-client.js';

const CONNECTION_TIMEOUT_MS = 5_000;
const SEARCH_TIMEOUT_MS = 10_000;
const INDEX_TIMEOUT_MS = 60_000;
const MUTATION_TIMEOUT_MS = 60_000;

export class NodeSetupTransport implements SetupTransport, SearchTransport, RelationshipTransport, MutationTransport, CompilationInboxTransport, TemplateStoreTransport {
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

  /** Inspects a user-managed remote endpoint without accepting or storing credentials. */
  public inspectProvider(provider: 'chatgpt' | 'mistral', endpoint: string): Promise<unknown> {
    return this.run('--provider-handshake', process.cwd(), {
      SECOND_BRAIN_PROVIDER: provider,
      SECOND_BRAIN_PROVIDER_ENDPOINT: endpoint
    }, CONNECTION_TIMEOUT_MS);
  }

  /** Stores the exact visible transfer before confirmation; provider credentials never enter this process. */
  public prepareProviderTransfer(vaultRoot: string, endpoint: string, request: unknown): Promise<unknown> {
    return this.run('--prepare-provider-transfer', vaultRoot, {
      SECOND_BRAIN_PROVIDER_ENDPOINT: endpoint,
      SECOND_BRAIN_CONSENT_REQUEST: JSON.stringify(request)
    }, MUTATION_TIMEOUT_MS);
  }

  /** Confirms only a persisted, server-bound consent token. */
  public confirmProviderTransfer(vaultRoot: string, confirmationToken: string): Promise<unknown> {
    return this.run('--confirm-provider-transfer', vaultRoot, {
      SECOND_BRAIN_CONSENT_CONFIRMATION: JSON.stringify({ confirmationToken })
    }, MUTATION_TIMEOUT_MS);
  }

  /** Marks the text-free local receipt revoked; no remote credential or vault text is involved. */
  public revokeProviderConsent(vaultRoot: string, receiptId: string): Promise<unknown> {
    return this.run('--revoke-provider-consent', vaultRoot, { SECOND_BRAIN_CONSENT_RECEIPT_ID: receiptId }, MUTATION_TIMEOUT_MS);
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
   * Liest die direkten Beziehungen einer indexierten Notiz.
   * @param vaultRoot Freigegebener Vault-Root.
   * @param relativePath Relativer Notizpfad.
   * @param signal Optionales Abbruchsignal.
   * @returns Ungeprüfte Sidecar-Antwort.
   * @throws Bei Abbruch, Timeout, Prozess- oder Vertragsfehlern.
   * @sideEffect Startet einen lokalen read-only Prozess.
   */
  public relationships(
    vaultRoot: string,
    relativePath: string,
    signal?: AbortSignal
  ): Promise<unknown> {
    return this.run(
      '--relationships',
      vaultRoot,
      { SECOND_BRAIN_RELATIONSHIP_PATH: relativePath },
      SEARCH_TIMEOUT_MS,
      signal
    );
  }

  public prepareMutation(
    vaultRoot: string,
    relativePath: string,
    content: string
  ): Promise<unknown> {
    return this.run('--prepare-mutation', vaultRoot, {
      SECOND_BRAIN_MUTATION_PATH: relativePath,
      SECOND_BRAIN_MUTATION_CONTENT: content
    }, MUTATION_TIMEOUT_MS);
  }

  public confirmMutation(vaultRoot: string, token: string): Promise<unknown> {
    return this.run('--confirm-mutation', vaultRoot, {
      SECOND_BRAIN_CONFIRMATION_TOKEN: token
    }, MUTATION_TIMEOUT_MS);
  }

  public prepareRollback(vaultRoot: string, auditId: string): Promise<unknown> {
    return this.run('--prepare-rollback', vaultRoot, {
      SECOND_BRAIN_AUDIT_ID: auditId
    }, MUTATION_TIMEOUT_MS);
  }

  public executeAutonomousMutation(
    vaultRoot: string,
    relativePath: string,
    content: string
  ): Promise<unknown> {
    return this.run('--autonomous-mutation', vaultRoot, {
      SECOND_BRAIN_AUTONOMOUS_MUTATION: JSON.stringify({ relativePath, content })
    }, MUTATION_TIMEOUT_MS);
  }

  public activateAutonomy(vaultRoot: string, mode: 'human-on' | 'human-out'): Promise<unknown> {
    return this.run('--activate-autonomy', vaultRoot, { SECOND_BRAIN_AUTONOMY_REQUEST: JSON.stringify({ mode, reviewed: true }) }, MUTATION_TIMEOUT_MS);
  }

  public autonomyStatus(vaultRoot: string): Promise<unknown> {
    return this.run('--autonomy-status', vaultRoot, {}, MUTATION_TIMEOUT_MS);
  }

  public pauseAutonomy(vaultRoot: string): Promise<unknown> {
    return this.run('--pause-autonomy', vaultRoot, {}, MUTATION_TIMEOUT_MS);
  }

  public prepareCompilation(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--prepare-compilation', vaultRoot, {
      SECOND_BRAIN_COMPILATION_REQUEST: JSON.stringify(request)
    }, MUTATION_TIMEOUT_MS);
  }

  public prepareTemplate(vaultRoot: string, name: string, content: string): Promise<unknown> {
    return this.run('--prepare-template', vaultRoot, {
      SECOND_BRAIN_TEMPLATE_REQUEST: JSON.stringify({ name, content })
    }, MUTATION_TIMEOUT_MS);
  }

  public confirmTemplate(vaultRoot: string, token: string): Promise<unknown> {
    return this.run('--confirm-template', vaultRoot, {
      SECOND_BRAIN_TEMPLATE_CONFIRMATION: JSON.stringify({ token })
    }, MUTATION_TIMEOUT_MS);
  }

  public history(vaultRoot: string): Promise<unknown> {
    return this.run('--change-history', vaultRoot, {}, MUTATION_TIMEOUT_MS);
  }

  public pendingCompilationSummary(vaultRoot: string): Promise<unknown> {
    return this.run('--pending-compilation-summary', vaultRoot, {}, MUTATION_TIMEOUT_MS);
  }

  public listPendingCompilations(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--list-pending-compilations', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public getPendingCompilation(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--get-pending-compilation', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public decidePendingCompilation(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--decide-pending-compilation', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public operationHistory(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--operation-history', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public listTemplates(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--list-templates', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public readTemplate(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--read-template', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  public writeTemplateVersion(vaultRoot: string, request: unknown): Promise<unknown> {
    return this.run('--write-template-version', vaultRoot, {}, MUTATION_TIMEOUT_MS, undefined, request);
  }

  /**
   * Führt eine Sidecar-Operation aus und bewahrt validierte öffentliche Fehlercodes.
   * @param operation CLI-Operation.
   * @param vaultRoot Freigegebener Vault-Root.
   * @param operationEnvironment Operationsspezifische Umgebungswerte.
   * @param timeout Maximale Laufzeit in Millisekunden.
   * @param signal Optionales Abbruchsignal.
   * @param stdinPayload Optionale große JSON-Nutzlast für stdin statt Umgebungsvariablen.
   * @returns Geparste Erfolgsantwort.
   * @throws Bei Abbruch, Timeout, validiertem Sidecar-Fehler oder ungültiger Antwort.
   * @sideEffect Startet genau einen lokalen Node-Prozess.
   */
  private run(
    operation: string,
    vaultRoot: string,
    operationEnvironment: Readonly<Record<string, string>>,
    timeout: number,
    signal?: AbortSignal,
    stdinPayload?: unknown
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const child = execFile(
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
      if (stdinPayload !== undefined) child.stdin?.end(JSON.stringify(stdinPayload));
    });
  }
}
