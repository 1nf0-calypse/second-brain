// Beschreibung: Laufzeitvalidierter Plugin-IPC-Client für die MCP-first Compilation Inbox.
// Artefakte:    US-000017; US-000008; ADR-000007
// Agent:        BE — 2026-08-15
import {
  CompilationDecisionResultSchema,
  OperationHistorySchema,
  PendingCompilationDetailSchema,
  PendingCompilationListSchema,
  PendingCompilationSummarySchema,
  type CompilationDecisionResult,
  type OperationHistory,
  type PendingCompilationDetail,
  type PendingCompilationList,
  type PendingCompilationSummary
} from '@second-brain/contracts';

export interface CompilationInboxTransport {
  pendingCompilationSummary(vaultRoot: string): Promise<unknown>;
  listPendingCompilations(vaultRoot: string, request: unknown): Promise<unknown>;
  getPendingCompilation(vaultRoot: string, request: unknown): Promise<unknown>;
  decidePendingCompilation(vaultRoot: string, request: unknown): Promise<unknown>;
  operationHistory(vaultRoot: string, request: unknown): Promise<unknown>;
}

/** Reads the lightweight inbox polling projection. */
export async function getPendingCompilationSummary(transport: CompilationInboxTransport, vaultRoot: string): Promise<PendingCompilationSummary> {
  return PendingCompilationSummarySchema.parse(await transport.pendingCompilationSummary(vaultRoot));
}

/** Lists pending review metadata without loading candidate content. */
export async function listPendingCompilations(transport: CompilationInboxTransport, vaultRoot: string, request: unknown = {}): Promise<PendingCompilationList> {
  return PendingCompilationListSchema.parse(await transport.listPendingCompilations(vaultRoot, request));
}

/** Loads and revalidates one proposal while rotating its decision token. */
export async function getPendingCompilation(transport: CompilationInboxTransport, vaultRoot: string, pendingId: string): Promise<PendingCompilationDetail> {
  return PendingCompilationDetailSchema.parse(await transport.getPendingCompilation(vaultRoot, { pendingId }));
}

/** Sends one explicit plugin-only confirm or reject decision. */
export async function decidePendingCompilation(transport: CompilationInboxTransport, vaultRoot: string, request: unknown): Promise<CompilationDecisionResult> {
  return CompilationDecisionResultSchema.parse(await transport.decidePendingCompilation(vaultRoot, request));
}

/** Reads the truthful cursor-based operation history. */
export async function getOperationHistory(transport: CompilationInboxTransport, vaultRoot: string, request: unknown = {}): Promise<OperationHistory> {
  return OperationHistorySchema.parse(await transport.operationHistory(vaultRoot, request));
}
