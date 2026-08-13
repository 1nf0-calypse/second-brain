// Beschreibung: Bildet interne Sidecar-Fehler auf den versionierten öffentlichen Vertrag ab.
// Artefakte:    US-000012; US-000014; US-000007; BUG-000003; BUG-000008; ADR-000004
// Agent:        BE — 2026-08-13
import { ZodError } from 'zod';
import {
  ErrorResponseSchema,
  type ErrorResponse
} from '@second-brain/contracts';
import { VaultScopeError } from '../policy/vault-root.js';
import { MutationError } from '../mutations/mutation-service.js';

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
  if (error instanceof MutationError) {
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
  if (error instanceof Error) {
    const code = error.message.split(':', 1)[0];
    const providerMessages = {
      PROVIDER_NOT_APPROVED: 'Select an approved remote provider.',
      PROVIDER_SCOPE_MISMATCH: 'The remote endpoint did not prove the exact restricted scopes.',
      CONSENT_REQUIRED: 'Review and confirm one exact transfer before sending data.',
      CONSENT_EXPIRED: 'This review is no longer valid because the data or provider policy changed.',
      SIDECAR_OFFLINE: 'The remote endpoint did not respond successfully.'
    } as const;
    if (code && code in providerMessages) {
      const providerCode = code as keyof typeof providerMessages;
      return ErrorResponseSchema.parse({ level: 'error', code: providerCode, message: providerMessages[providerCode] });
    }
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
