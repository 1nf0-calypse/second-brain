// Beschreibung: Typisierte Plugin-Schnittstelle zum lokalen Setup-Handshake.
// Artefakte:    US-000011; ADR-000001
// Agent:        FE — 2026-07-30
import {
  SetupResponseSchema,
  type SetupResponse
} from '@second-brain/contracts';

export interface SetupTransport {
  testConnection(vaultRoot: string): Promise<unknown>;
}

/**
 * Validiert die Sidecar-Antwort und erzwingt die vereinbarte Vertragsversion.
 * @param transport Lokaler, injizierbarer Prozess-Transport.
 * @param vaultRoot Vom Nutzer ausgewählter Vault-Root.
 * @returns Validierte Claude-Desktop-Verbindungsantwort.
 * @throws Bei Timeout, Transport- oder Vertragsfehler.
 */
export async function testClaudeConnection(
  transport: SetupTransport,
  vaultRoot: string
): Promise<SetupResponse> {
  const response = await transport.testConnection(vaultRoot);
  return SetupResponseSchema.parse(response);
}
