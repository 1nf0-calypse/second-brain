// Beschreibung: Typisierte Plugin-Schnittstelle für direkte lokale Beziehungen.
// Artefakte:    US-000013; BUG-000004; ADR-000001; ADR-000004
// Agent:        FE — 2026-07-31
import {
  RelationshipQueryResponseSchema,
  type RelationshipQueryResponse
} from '@second-brain/contracts';

export interface RelationshipTransport {
  synchronizeIndex(vaultRoot: string): Promise<unknown>;
  relationships(
    vaultRoot: string,
    relativePath: string,
    signal?: AbortSignal
  ): Promise<unknown>;
}

// Implementiert: US-000013 — Laufzeitvalidierte Relationship-Abfrage
/**
 * Aktualisiert den abgeleiteten Index und fragt danach direkte Beziehungen ab.
 * @param transport Injizierbarer lokaler Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @param relativePath Relativer Pfad der Notiz.
 * @param signal Optionales Abbruchsignal.
 * @returns Validierte read-only Relationship-Antwort.
 * @throws Bei Transport-, Abbruch- oder Vertragsfehlern.
 */
export async function getRelationships(
  transport: RelationshipTransport,
  vaultRoot: string,
  relativePath: string,
  signal?: AbortSignal
): Promise<RelationshipQueryResponse> {
  await transport.synchronizeIndex(vaultRoot);
  return RelationshipQueryResponseSchema.parse(
    await transport.relationships(vaultRoot, relativePath, signal)
  );
}
