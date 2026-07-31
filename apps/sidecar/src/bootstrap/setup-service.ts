// Beschreibung: Orchestriert den read-only Setup-Handshake für Claude Desktop.
// Artefakte:    US-000011; ADR-000001; ADR-000004
// Agent:        BE — 2026-07-30
import {
  CONTRACT_VERSION,
  SetupRequestSchema,
  SetupResponseSchema,
  type SetupRequest,
  type SetupResponse
} from '@second-brain/contracts';
import { validateVaultRoot } from '../policy/vault-root.js';

// Implementiert: US-000011 — Claude Desktop lokal einrichten
/**
 * Validiert Clientvertrag und Vault, ohne Nutzerdaten zu verändern.
 * @param input Ungeprüfte Eingabe von der Prozessgrenze.
 * @returns Validierte read-only Setup-Antwort.
 * @throws ZodError oder VaultScopeError bei ungültiger Eingabe.
 */
export async function performSetupHandshake(input: unknown): Promise<SetupResponse> {
  const request: SetupRequest = SetupRequestSchema.parse(input);
  await validateVaultRoot(request.vaultRoot);
  return SetupResponseSchema.parse({
    contractVersion: CONTRACT_VERSION,
    client: 'claude-desktop',
    capability: 'setup:read',
    vaultReady: true,
    message: 'Claude Desktop connected with read-only setup access.'
  });
}

/**
 * Erstellt den kopierbaren Claude-Desktop-Konfigurationsausschnitt.
 * @param sidecarEntry Absoluter Pfad zum gebauten Sidecar-Entry.
 * @param vaultRoot Vom Nutzer freigegebener Vault-Root.
 * @returns JSON-serialisierbarer MCP-Konfigurationsausschnitt.
 * @throws Wirft nicht.
 */
export function createClaudeDesktopConfiguration(
  sidecarEntry: string,
  vaultRoot: string
): Readonly<Record<string, unknown>> {
  return {
    mcpServers: {
      'second-brain': {
        command: 'node',
        args: [sidecarEntry],
        env: {
          SECOND_BRAIN_VAULT_ROOT: vaultRoot,
          SECOND_BRAIN_CONTRACT_VERSION: CONTRACT_VERSION
        }
      }
    }
  };
}
