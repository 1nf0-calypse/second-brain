// Beschreibung: Laufzeitvalidierte Plugin-Schnittstelle für bestätigungspflichtige Notizänderungen.
// Artefakte:    US-000014; ADR-000003; ADR-000004
// Agent:        FE — 2026-07-31
import {
  MutationPreviewSchema,
  MutationResultSchema,
  type MutationPreview,
  type MutationResult
} from '@second-brain/contracts';

export interface MutationTransport {
  prepareMutation(vaultRoot: string, relativePath: string, content: string): Promise<unknown>;
  confirmMutation(vaultRoot: string, token: string): Promise<unknown>;
  prepareRollback(vaultRoot: string, auditId: string): Promise<unknown>;
}

export async function prepareNoteChange(
  transport: MutationTransport,
  vaultRoot: string,
  relativePath: string,
  content: string
): Promise<MutationPreview> {
  return MutationPreviewSchema.parse(
    await transport.prepareMutation(vaultRoot, relativePath, content)
  );
}

export async function confirmNoteChange(
  transport: MutationTransport,
  vaultRoot: string,
  token: string
): Promise<MutationResult> {
  return MutationResultSchema.parse(await transport.confirmMutation(vaultRoot, token));
}

export async function prepareNoteRollback(
  transport: MutationTransport,
  vaultRoot: string,
  auditId: string
): Promise<MutationPreview> {
  return MutationPreviewSchema.parse(
    await transport.prepareRollback(vaultRoot, auditId)
  );
}
