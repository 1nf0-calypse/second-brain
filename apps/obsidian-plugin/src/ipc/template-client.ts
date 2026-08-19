// Beschreibung: Laufzeitvalidierter Plugin-IPC-Client für dateibasierte Compilation Templates.
// Artefakte:    US-000016; ADR-000007
// Agent:        BE — 2026-08-15
import {
  StoredTemplateVersionSchema,
  TemplateListSchema,
  type StoredTemplateVersion
} from '@second-brain/contracts';

export interface TemplateStoreTransport {
  listTemplates(vaultRoot: string, request: unknown): Promise<unknown>;
  readTemplate(vaultRoot: string, request: unknown): Promise<unknown>;
  writeTemplateVersion(vaultRoot: string, request: unknown): Promise<unknown>;
}

/** Lists project-local immutable template versions. */
export async function listTemplates(transport: TemplateStoreTransport, vaultRoot: string, request: unknown = {}): Promise<ReturnType<typeof TemplateListSchema.parse>> {
  return TemplateListSchema.parse(await transport.listTemplates(vaultRoot, request));
}

/** Reads one hash-verified template version. */
export async function readTemplate(transport: TemplateStoreTransport, vaultRoot: string, id: string, version: number): Promise<StoredTemplateVersion> {
  return StoredTemplateVersionSchema.parse(await transport.readTemplate(vaultRoot, { id, version }));
}

/** Persists one reviewed template version atomically. */
export async function writeTemplateVersion(transport: TemplateStoreTransport, vaultRoot: string, request: unknown): Promise<StoredTemplateVersion> {
  return StoredTemplateVersionSchema.parse(await transport.writeTemplateVersion(vaultRoot, request));
}
