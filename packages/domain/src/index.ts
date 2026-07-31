// Beschreibung: Infrastrukturfreie Domänentypen für Vault-Dateien und Index-Deltas.
// Artefakte:    US-000005; ADR-000002; ADR-000003
// Agent:        BE — 2026-07-30
export interface VaultFile {
  readonly relativePath: string;
  readonly fingerprint: string;
  readonly modifiedAt: number;
  readonly size: number;
}

export interface IndexDelta {
  readonly created: readonly VaultFile[];
  readonly changed: readonly VaultFile[];
  readonly deleted: readonly string[];
  readonly unchanged: readonly VaultFile[];
}

/**
 * Vergleicht gespeicherte und aktuelle Fingerprints ohne Infrastrukturabhängigkeit.
 * @param previous Zuletzt persistierter Dateistand.
 * @param current Aktuell gescannter Dateistand.
 * @returns Delta mit erstellten, geänderten, gelöschten und unveränderten Dateien.
 * @throws Wirft nicht.
 */
export function calculateDelta(
  previous: readonly VaultFile[],
  current: readonly VaultFile[]
): IndexDelta {
  const previousByPath = new Map(previous.map((file) => [file.relativePath, file]));
  const currentByPath = new Map(current.map((file) => [file.relativePath, file]));
  const created: VaultFile[] = [];
  const changed: VaultFile[] = [];
  const unchanged: VaultFile[] = [];

  for (const file of current) {
    const oldFile = previousByPath.get(file.relativePath);
    if (!oldFile) {
      created.push(file);
    } else if (oldFile.fingerprint !== file.fingerprint) {
      changed.push(file);
    } else {
      unchanged.push(file);
    }
  }

  return {
    created,
    changed,
    unchanged,
    deleted: previous
      .filter((file) => !currentByPath.has(file.relativePath))
      .map((file) => file.relativePath)
  };
}
