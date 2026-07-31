// Beschreibung: Typisierte Plugin-Schnittstelle für direkte lokale Beziehungen.
// Artefakte:    US-000013; ADR-000001; ADR-000004
// Agent:        FE — 2026-07-31
import {
  RelationshipQueryResponseSchema,
  type RelationshipQueryResponse
} from '@second-brain/contracts';

export interface RelationshipTransport {
  relationships(
    vaultRoot: string,
    relativePath: string,
    signal?: AbortSignal
  ): Promise<unknown>;
}

// Implementiert: US-000013 — Laufzeitvalidierte Relationship-Abfrage
/**
 * Fragt direkte Beziehungen ab und validiert die Sidecar-Grenze.
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
  return RelationshipQueryResponseSchema.parse(
    await transport.relationships(vaultRoot, relativePath, signal)
  );
}
