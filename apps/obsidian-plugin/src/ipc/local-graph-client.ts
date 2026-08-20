// Beschreibung: Typisierte Plugin-Schnittstelle für die lokale, rein lesende Fokus-Graphprojektion.
// Artefakte:    US-000004; UX-000005; ADR-000001; ADR-000003
// Agent:        BE — 2026-08-19
import {
  LocalGraphResponseSchema,
  type LocalGraphResponse
} from '@second-brain/contracts';

export interface LocalGraphTransport {
  synchronizeIndex(vaultRoot: string): Promise<unknown>;
  localGraph(vaultRoot: string, relativePath: string, signal?: AbortSignal): Promise<unknown>;
}

// Implementiert: US-000004 — Laufzeitvalidierte Fokus-Graphabfrage
/**
 * Aktualisiert den abgeleiteten Index und fragt die sichere Fokus-Projektion ab.
 * @param transport Injizierbarer lokaler Transport.
 * @param vaultRoot Freigegebener Vault-Root.
 * @param relativePath Relativer Pfad der fokussierten Notiz.
 * @param signal Optionales Abbruchsignal.
 * @returns Validierten, rein lesenden lokalen Graphen.
 * @throws Bei Transport-, Abbruch- oder Vertragsfehlern.
 */
export async function getLocalGraph(
  transport: LocalGraphTransport,
  vaultRoot: string,
  relativePath: string,
  signal?: AbortSignal
): Promise<LocalGraphResponse> {
  await transport.synchronizeIndex(vaultRoot);
  return LocalGraphResponseSchema.parse(
    await transport.localGraph(vaultRoot, relativePath, signal)
  );
}
