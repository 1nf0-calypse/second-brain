// Beschreibung: Führt den versionierten Setup-Handshake über einen lokalen Kindprozess aus.
// Artefakte:    US-000011; ADR-000001
// Agent:        FE — 2026-07-30
import { execFile } from 'node:child_process';
import { CONTRACT_VERSION } from '@second-brain/contracts';
import type { SetupTransport } from './setup-client.js';

const CONNECTION_TIMEOUT_MS = 5_000;

export class NodeSetupTransport implements SetupTransport {
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
    return this.run('--setup-handshake', vaultRoot);
  }

  /** Aktualisiert den lokalen Index in einem einmaligen Sidecar-Prozess. */
  public synchronizeIndex(vaultRoot: string): Promise<unknown> {
    return this.run('--sync-index', vaultRoot);
  }

  /** Baut den lokalen Index in einem einmaligen Sidecar-Prozess atomar neu auf. */
  public rebuildIndex(vaultRoot: string): Promise<unknown> {
    return this.run('--rebuild-index', vaultRoot);
  }

  private run(operation: string, vaultRoot: string): Promise<unknown> {
    return new Promise((resolve, reject) => {
      execFile(
        this.nodeExecutable,
        [this.sidecarEntry, operation],
        {
          timeout: CONNECTION_TIMEOUT_MS,
          windowsHide: true,
          env: {
            ...process.env,
            SECOND_BRAIN_VAULT_ROOT: vaultRoot,
            SECOND_BRAIN_CONTRACT_VERSION: CONTRACT_VERSION
          }
        },
        (error, stdout) => {
          if (error) {
            const message =
              error.killed || error.signal
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
