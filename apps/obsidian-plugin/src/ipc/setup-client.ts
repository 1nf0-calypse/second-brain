// Beschreibung: Typisierte Plugin-Schnittstelle zum lokalen Setup-Handshake.
// Artefakte:    US-000011; ADR-000001
// Agent:        FE — 2026-07-30
import {
  IndexStatusSchema,
  SetupResponseSchema,
  type IndexStatus,
  type SetupResponse
} from '@second-brain/contracts';

export interface SetupTransport {
  testConnection(vaultRoot: string): Promise<unknown>;
  synchronizeIndex(vaultRoot: string): Promise<unknown>;
  rebuildIndex(vaultRoot: string): Promise<unknown>;
}

/**
 * Validiert die Sidecar-Antwort und erzwingt die vereinbarte Vertragsversion.
 * @param transport Lokaler, injizierbarer Prozess-Transport.
 * @param vaultRoot Vom Nutzer ausgewählter Vault-Root.
 * @returns Validierte Antwort des lokal gestarteten Sidecars.
 * @throws Bei Timeout, Transport- oder Vertragsfehler.
 */
export async function testLocalService(
  transport: SetupTransport,
  vaultRoot: string
): Promise<SetupResponse> {
  const response = await transport.testConnection(vaultRoot);
  return SetupResponseSchema.parse(response);
}

/**
 * Validiert eine inkrementelle lokale Indexaktualisierung.
 * @param transport Lokaler Prozess-Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @returns Validierter Indexstatus.
 * @throws Bei Transport- oder Vertragsfehlern.
 */
export async function synchronizeIndex(
  transport: SetupTransport,
  vaultRoot: string
): Promise<IndexStatus> {
  return IndexStatusSchema.parse(await transport.synchronizeIndex(vaultRoot));
}

/**
 * Validiert einen atomaren lokalen Index-Neuaufbau.
 * @param transport Lokaler Prozess-Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @returns Validierter Indexstatus.
 * @throws Bei Transport- oder Vertragsfehlern.
 */
export async function rebuildIndex(
  transport: SetupTransport,
  vaultRoot: string
): Promise<IndexStatus> {
  return IndexStatusSchema.parse(await transport.rebuildIndex(vaultRoot));
}
