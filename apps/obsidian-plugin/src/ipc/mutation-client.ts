// Beschreibung: Laufzeitvalidierte Plugin-Schnittstelle für kontrollierte Notizänderungen und Autonomie.
// Artefakte:    US-000003; US-000014; ADR-000003; ADR-000004
// Agent:        FE — 2026-08-13
import {
  MutationPreviewSchema,
  MutationResultSchema,
  AutonomyStatusSchema,
  type AutonomyMode,
  type AutonomyStatus,
  type MutationPreview,
  type MutationResult
} from '@second-brain/contracts';

export interface MutationTransport {
  prepareMutation(vaultRoot: string, relativePath: string, content: string): Promise<unknown>;
  confirmMutation(vaultRoot: string, token: string): Promise<unknown>;
  prepareRollback(vaultRoot: string, auditId: string): Promise<unknown>;
  executeAutonomousMutation(vaultRoot: string, relativePath: string, content: string): Promise<unknown>;
  activateAutonomy(vaultRoot: string, mode: AutonomyMode): Promise<unknown>;
  autonomyStatus(vaultRoot: string): Promise<unknown>;
  pauseAutonomy(vaultRoot: string): Promise<unknown>;
}

/** Activates a reviewed server-owned autonomy policy. */
export async function activateAutonomy(transport: MutationTransport, vaultRoot: string, mode: Extract<AutonomyMode, 'human-on' | 'human-out'>): Promise<AutonomyStatus> {
  return AutonomyStatusSchema.parse(await transport.activateAutonomy(vaultRoot, mode));
}

/** Reads the authoritative local autonomy state. */
export async function getAutonomyStatus(transport: MutationTransport, vaultRoot: string): Promise<AutonomyStatus> {
  return AutonomyStatusSchema.parse(await transport.autonomyStatus(vaultRoot));
}

/** Pauses automatic mutations immediately. */
export async function pauseAutonomy(transport: MutationTransport, vaultRoot: string): Promise<AutonomyStatus> {
  return AutonomyStatusSchema.parse(await transport.pauseAutonomy(vaultRoot));
}

/** Applies one server-authorized Markdown create or update without a second confirmation. */
export async function executeAutonomousMutation(
  transport: MutationTransport,
  vaultRoot: string,
  relativePath: string,
  content: string
): Promise<MutationResult> {
  return MutationResultSchema.parse(
    await transport.executeAutonomousMutation(vaultRoot, relativePath, content)
  );
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
