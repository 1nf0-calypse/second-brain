// Beschreibung: Laufzeitunabhängige Setup- und Index-Präsentationslogik.
// Artefakte:    US-000011; US-000005; UX-000001; UX-000002
// Agent:        FE — 2026-07-30
import type { IndexStatus } from '@second-brain/contracts';

/**
 * Erstellt eine ungefährliche Vorschau ohne Secrets oder API-Keys.
 * @param vaultRoot Vom Nutzer eingegebener Vault-Root.
 * @param sidecarEntry Absoluter Pfad zum installierten Sidecar.
 * @returns Claude-Desktop-Konfigurationsvorschau.
 * @throws Wirft nicht.
 */
export function createConfigurationPreview(
  vaultRoot: string,
  sidecarEntry: string
): Readonly<Record<string, unknown>> {
  return {
    mcpServers: {
      'second-brain': {
        command: 'node',
        args: [sidecarEntry],
        env: {
          SECOND_BRAIN_VAULT_ROOT: vaultRoot,
          SECOND_BRAIN_CONTRACT_VERSION: '1.0.0'
        }
      }
    }
  };
}

/**
 * Formatiert den Indexstatus für eine zugängliche Live-Region.
 * @param status Validierter Indexstatus.
 * @returns Nutzerverständliche Statuszeile.
 * @throws Wirft nicht.
 */
export function formatIndexStatus(status: IndexStatus): string {
  return `${status.message} ${status.indexedFiles} files indexed; ${status.changedFiles} changed; ` +
    `${status.deletedFiles} removed. Original files unchanged.`;
}
