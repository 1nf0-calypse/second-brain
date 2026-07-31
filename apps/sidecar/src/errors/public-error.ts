// Beschreibung: Bildet interne Sidecar-Fehler auf den versionierten öffentlichen Vertrag ab.
// Artefakte:    US-000012; BUG-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { ZodError } from 'zod';
import {
  ErrorResponseSchema,
  type ErrorResponse
} from '@second-brain/contracts';
import { VaultScopeError } from '../policy/vault-root.js';

/**
 * Erzeugt eine laufzeitvalidierte, inhaltsarme Fehlerantwort für öffentliche Transporte.
 * @param error Interner Fehler einer CLI- oder MCP-Operation.
 * @returns Stabiler Fehlercode und sichere Recovery-Nachricht.
 * @throws Wirft nicht; selbst unbekannte Fehler werden auf einen Vertragscode reduziert.
 */
export function toPublicErrorResponse(error: unknown): ErrorResponse {
  if (error instanceof VaultScopeError) {
    return ErrorResponseSchema.parse({
      level: 'error',
      code: error.code,
      message: error.message
    });
  }
  if (error instanceof ZodError) {
    return ErrorResponseSchema.parse({
      level: 'error',
      code: 'INVALID_QUERY',
      message: 'The search or read request is invalid.'
    });
  }
  return ErrorResponseSchema.parse({
    level: 'error',
    code: 'SIDECAR_OFFLINE',
    message: 'The local service could not complete the request.'
  });
}

/**
 * Verpackt einen öffentlichen Fehler als MCP-Tool-Ergebnis.
 * @param error Interner Handler-Fehler.
 * @returns MCP-kompatibler Fehler-Payload mit `isError`.
 * @throws Wirft nicht.
 */
export function toMcpToolError(error: unknown): {
  content: Array<{ type: 'text'; text: string }>;
  isError: true;
} {
  return {
    content: [{
      type: 'text',
      text: JSON.stringify(toPublicErrorResponse(error))
    }],
    isError: true
  };
}
