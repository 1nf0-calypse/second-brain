// Beschreibung: Prüft identische öffentliche Fehlercodes für CLI- und MCP-Grenzen.
// Artefakte:    US-000012; BUG-000003; ADR-000004
// Agent:        BE — 2026-07-31
import { describe, expect, it } from 'vitest';
import {
  toMcpToolError,
  toPublicErrorResponse
} from '../../apps/sidecar/src/errors/public-error.js';
import { VaultScopeError } from '../../apps/sidecar/src/policy/vault-root.js';
import { SearchRequestSchema } from '../../packages/contracts/src/index.js';

describe('public sidecar errors', () => {
  it('erhält den Scope-Code am CLI-Vertragsrand', () => {
    expect(toPublicErrorResponse(new VaultScopeError(
      'PATH_OUTSIDE_VAULT',
      'Access was blocked.'
    ))).toEqual({
      level: 'error',
      code: 'PATH_OUTSIDE_VAULT',
      message: 'Access was blocked.'
    });
  });

  it('liefert denselben Scope-Code als MCP-Tool-Fehler', () => {
    const result = toMcpToolError(new VaultScopeError(
      'PATH_OUTSIDE_VAULT',
      'Access was blocked.'
    ));
    expect(result.isError).toBe(true);
    expect(JSON.parse(result.content[0]?.text ?? '{}')).toMatchObject({
      code: 'PATH_OUTSIDE_VAULT'
    });
  });

  it('reduziert Vertragsfehler auf INVALID_QUERY ohne Eingabedetails', () => {
    let validationError: unknown;
    try {
      SearchRequestSchema.parse({ query: '' });
    } catch (error: unknown) {
      validationError = error;
    }
    expect(toPublicErrorResponse(validationError)).toEqual({
      level: 'error',
      code: 'INVALID_QUERY',
      message: 'The search or read request is invalid.'
    });
  });

  it('reduziert unbekannte interne Fehler ohne Leakage auf SIDECAR_OFFLINE', () => {
    expect(toPublicErrorResponse(new Error('secret internal detail'))).toEqual({
      level: 'error',
      code: 'SIDECAR_OFFLINE',
      message: 'The local service could not complete the request.'
    });
  });
});
