// Beschreibung: Laufzeitunabhaengige Recovery-Microcopy fuer Compilation-Fehler.
// Artefakte:    US-000017; UX-000004
// Agent:        FE — 2026-08-15
export function compilationErrorMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : 'The operation failed.';
  if (raw.includes('COMPILATION_DRIFT')) return 'This proposal conflicts with changed source or target notes. Ask the MCP client to submit a fresh compilation.';
  if (raw.includes('CONFIRMATION_EXPIRED')) return 'This review expired before a decision was completed. Ask the MCP client to submit it again.';
  if (raw.includes('CONFIRMATION_ALREADY_DECIDED')) return 'This proposal was already decided. Refresh Pending reviews or check History for the actual outcome.';
  if (raw.includes('PENDING_CAPACITY_REACHED')) return 'The pending review inbox is full. Decide or reject an existing proposal before retrying.';
  return raw;
}
