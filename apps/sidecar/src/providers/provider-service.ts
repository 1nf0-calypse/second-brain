// Beschreibung: Erzwingt zugelassene Remote-Provider und einmalige, inhaltsfreie Consent-Quittungen.
// Artefakte:    US-000001; US-000007; ADR-000006
// Agent:        BE — 2026-08-12
import { createHash, randomUUID } from 'node:crypto';
import { DatabaseSync } from 'node:sqlite';
import {
  CONTRACT_VERSION,
  ConsentPrepareRequestSchema,
  ConsentConfirmRequestSchema,
  ConsentPreviewSchema,
  ConsentReceiptSchema,
  ProviderConfigurationSchema,
  ProviderHandshakeRequestSchema,
  ProviderHandshakeResponseSchema,
  type ConsentPreview,
  type ConsentReceipt,
  type ConsentPrepareRequest,
  type ProviderConfiguration,
  type ProviderHandshakeResponse,
  type ProviderId
} from '@second-brain/contracts';

// Implementiert: US-000001, US-000007 — Provider-Port, Setup-Grenze und Einmal-Consent.

const CONSENT_TTL_MS = 5 * 60 * 1000;
const APPROVED_PROVIDERS: Readonly<Record<ProviderId, ProviderConfiguration>> = {
  chatgpt: {
    provider: 'chatgpt',
    endpoint: 'https://remote.example.invalid/mcp',
    sourceUrl: 'https://help.openai.com/en/articles/12584461-developer-mode-apps-and-full-mcp-connectors-in-chatgpt-beta',
    reviewedAt: '2026-08-12T00:00:00.000Z',
    policyVersion: 'chatgpt-2026-08-12',
    allowedCategories: ['text-excerpt', 'pseudonymous-source-id']
  },
  mistral: {
    provider: 'mistral',
    endpoint: 'https://connector.example.invalid/mcp',
    sourceUrl: 'https://docs.mistral.ai/studio-api/connectors',
    reviewedAt: '2026-08-12T00:00:00.000Z',
    policyVersion: 'mistral-2026-08-12',
    allowedCategories: ['text-excerpt', 'pseudonymous-source-id']
  }
};

export interface ProviderAdapter {
  execute(input: Readonly<{ provider: ProviderId; endpoint: string; purpose: string; operation: string; excerpts: ConsentPrepareRequest['excerpts']; payloadHash: string }>): Promise<void>;
  handshake(input: Readonly<{ provider: ProviderId; endpoint: string; expectedScope: readonly string[] }>): Promise<readonly string[]>;
}

/** Concrete, credential-free MCP-over-HTTPS boundary for a user-managed endpoint. */
export class RemoteMcpProviderAdapter implements ProviderAdapter {
  public constructor(private readonly request: typeof fetch = fetch) {}

  public async handshake(input: Readonly<{ provider: ProviderId; endpoint: string; expectedScope: readonly string[] }>): Promise<readonly string[]> {
    const initialize = await this.call(input.endpoint, 'initialize', {
      protocolVersion: '2025-06-18',
      capabilities: {},
      clientInfo: { name: 'second-brain', version: CONTRACT_VERSION }
    });
    if (!initialize || typeof initialize !== 'object') throw new Error('PROVIDER_SCOPE_MISMATCH: The endpoint did not return an MCP manifest.');
    const manifest = await this.call(input.endpoint, 'tools/list', {}) as { tools?: Array<{ name?: unknown }> };
    if (!manifest.tools?.some((tool) => tool.name === 'second_brain_transfer_once')) {
      throw new Error('PROVIDER_SCOPE_MISMATCH: The remote MCP manifest does not expose the restricted transfer tool.');
    }
    const response = await this.request(input.endpoint, {
      method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: randomUUID(), method: 'second-brain/scopes', params: { provider: input.provider } }),
      signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) throw new Error('SIDECAR_OFFLINE: The remote endpoint did not accept the scope inspection.');
    const json = await response.json() as { result?: { scopes?: unknown } };
    return Array.isArray(json.result?.scopes) ? json.result.scopes.filter((scope): scope is string => typeof scope === 'string') : [];
  }

  public async execute(input: Readonly<{ provider: ProviderId; endpoint: string; purpose: string; operation: string; excerpts: ConsentPrepareRequest['excerpts']; payloadHash: string }>): Promise<void> {
    await this.call(input.endpoint, 'tools/call', {
      name: 'second_brain_transfer_once',
      arguments: { provider: input.provider, purpose: input.purpose, operation: input.operation, excerpts: input.excerpts, payloadHash: input.payloadHash }
    });
  }

  private async call(endpoint: string, method: string, params: object): Promise<unknown> {
    const validatedEndpoint = ProviderHandshakeRequestSchema.shape.endpoint.parse(endpoint);
    const response = await this.request(validatedEndpoint, {
      method: 'POST', redirect: 'error', headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: randomUUID(), method, params }), signal: AbortSignal.timeout(5_000)
    });
    if (!response.ok) throw new Error('SIDECAR_OFFLINE: The remote endpoint did not respond successfully.');
    const body = await response.json() as { result?: unknown; error?: unknown };
    if (body.error || !('result' in body)) throw new Error('PROVIDER_SCOPE_MISMATCH: The remote endpoint rejected the restricted operation.');
    return body.result;
  }
}

/** Returns a credential-free provider record; endpoints are user-managed placeholders until configured. */
export function getApprovedProviderConfiguration(provider: ProviderId): ProviderConfiguration {
  return ProviderConfigurationSchema.parse(APPROVED_PROVIDERS[provider]);
}

interface PendingConsent {
  preview: ConsentPreview;
  excerpts: ConsentPrepareRequest['excerpts'];
  sourceIds: string[];
}

/** Performs a real HTTPS MCP handshake; only the user-managed endpoint authenticates the provider. */
export async function inspectProviderConnection(
  input: unknown,
  adapter: ProviderAdapter
): Promise<ProviderHandshakeResponse> {
  const request = ProviderHandshakeRequestSchema.parse(input);
  const scopes = await adapter.handshake(request);
  const uniqueScopes = [...new Set(scopes)];
  const connected = request.expectedScope.length === uniqueScopes.length
    && request.expectedScope.every((scope) => uniqueScopes.includes(scope));
  return ProviderHandshakeResponseSchema.parse({
    contractVersion: CONTRACT_VERSION,
    provider: request.provider,
    endpoint: request.endpoint,
    connected,
    configured: true,
    scopes: uniqueScopes,
    message: connected
      ? 'Remote endpoint handshake, manifest, and required scopes verified.'
      : 'The remote endpoint did not prove the required restricted scopes.'
  });
}

/** Holds one-time consent only in sidecar memory; neither payloads nor credentials are persisted. */
export class ConsentService {
  private readonly pending = new Map<string, PendingConsent>();
  private readonly receipts = new Map<string, ConsentReceipt>();

  public constructor(private readonly now: () => Date = () => new Date()) {}

  /** Prepares the exact minimal payload representation the user must inspect. */
  public prepare(input: unknown): ConsentPreview {
    const request = ConsentPrepareRequestSchema.parse(input);
    const configuration = getApprovedProviderConfiguration(request.provider);
    if (request.policyVersion !== configuration.policyVersion) {
      throw new Error('CONSENT_EXPIRED: The provider policy changed. Review the updated data.');
    }
    const now = this.now().getTime();
    for (const [token, pending] of this.pending) {
      if (new Date(pending.preview.expiresAt).getTime() <= now) this.pending.delete(token);
    }
    const canonicalPayload = JSON.stringify({
      provider: request.provider,
      purpose: request.purpose,
      operation: request.operation,
      excerpts: request.excerpts
    });
    const token = randomUUID();
    const preview = ConsentPreviewSchema.parse({
      provider: request.provider,
      purpose: request.purpose,
      operation: request.operation,
      categories: ['text-excerpt', 'pseudonymous-source-id'],
      payloadHash: createHash('sha256').update(canonicalPayload).digest('hex'),
      policyVersion: request.policyVersion,
      excerpts: request.excerpts,
      confirmationToken: token,
      expiresAt: new Date(this.now().getTime() + CONSENT_TTL_MS).toISOString()
    });
    this.pending.set(token, { preview, excerpts: request.excerpts, sourceIds: request.excerpts.map((excerpt) => excerpt.sourceId) });
    return preview;
  }

  /** Confirms exactly one unchanged preview and delegates only its confirmed minimal payload. */
  public async confirm(token: string, adapter: ProviderAdapter, endpoint: string): Promise<ConsentReceipt> {
    const pending = this.pending.get(token);
    if (!pending) throw new Error('CONSENT_REQUIRED: Prepare and confirm one exact transfer.');
    if (new Date(pending.preview.expiresAt).getTime() <= this.now().getTime()) {
      this.pending.delete(token);
      throw new Error('CONSENT_EXPIRED: Prepare a fresh transfer preview.');
    }
    const configuration = getApprovedProviderConfiguration(pending.preview.provider);
    if (pending.preview.policyVersion !== configuration.policyVersion) {
      this.pending.delete(token);
      throw new Error('CONSENT_EXPIRED: The provider policy changed. Review the updated data.');
    }
    ProviderHandshakeRequestSchema.shape.endpoint.parse(endpoint);
    // Claim before awaiting the network so concurrent confirms cannot replay the transfer.
    this.pending.delete(token);
    await adapter.execute({ provider: pending.preview.provider, endpoint, purpose: pending.preview.purpose, operation: pending.preview.operation, excerpts: pending.excerpts, payloadHash: pending.preview.payloadHash });
    const receipt = ConsentReceiptSchema.parse({
      receiptId: randomUUID(),
      provider: pending.preview.provider,
      purpose: pending.preview.purpose,
      operation: pending.preview.operation,
      categories: pending.preview.categories,
      sourceIds: pending.sourceIds,
      payloadHash: pending.preview.payloadHash,
      policyVersion: pending.preview.policyVersion,
      confirmedAt: this.now().toISOString(),
      revokedAt: null
    });
    this.receipts.set(receipt.payloadHash, receipt);
    return receipt;
  }

  /** Revokes an in-memory receipt without recording the transferred text. */
  public revoke(payloadHash: string): ConsentReceipt {
    const receipt = this.receipts.get(payloadHash);
    if (!receipt) throw new Error('CONSENT_REQUIRED: No active consent receipt exists.');
    const revoked = ConsentReceiptSchema.parse({ ...receipt, revokedAt: this.now().toISOString() });
    this.receipts.set(payloadHash, revoked);
    return revoked;
  }
}

/** Persists short-lived provider previews so confirmation survives the native child-process boundary. */
export class ProviderConsentStore {
  private readonly database: DatabaseSync;

  public constructor(databasePath: string, private readonly now: () => Date = () => new Date()) {
    this.database = new DatabaseSync(databasePath);
    this.database.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS provider_consent_previews (
        token TEXT PRIMARY KEY,
        request_json TEXT NOT NULL,
        endpoint TEXT NOT NULL,
        expires_at TEXT NOT NULL,
        used_at TEXT
      );
    `);
  }

  /** Stores one exact visible payload and returns its short-lived review token. */
  public prepare(input: unknown, endpoint: string): ConsentPreview {
    const request = ConsentPrepareRequestSchema.parse(input);
    ProviderHandshakeRequestSchema.shape.endpoint.parse(endpoint);
    const preview = new ConsentService(this.now).prepare(request);
    this.database.prepare('DELETE FROM provider_consent_previews WHERE expires_at <= ? OR used_at IS NOT NULL')
      .run(this.now().toISOString());
    this.database.prepare(`
      INSERT INTO provider_consent_previews(token, request_json, endpoint, expires_at, used_at)
      VALUES (?, ?, ?, ?, NULL)
    `).run(preview.confirmationToken, JSON.stringify(request), endpoint, preview.expiresAt);
    return preview;
  }

  /** Claims a prepared token atomically and returns only its server-bound transfer details. */
  public claim(input: unknown): { request: ConsentPrepareRequest; endpoint: string } {
    const { confirmationToken } = ConsentConfirmRequestSchema.parse(input);
    const now = this.now().toISOString();
    const row = this.database.prepare(`
      SELECT request_json, endpoint FROM provider_consent_previews
      WHERE token = ? AND used_at IS NULL AND expires_at > ?
    `).get(confirmationToken, now) as { request_json: string; endpoint: string } | undefined;
    const claim = this.database.prepare(`
      UPDATE provider_consent_previews SET used_at = ?
      WHERE token = ? AND used_at IS NULL AND expires_at > ?
    `).run(now, confirmationToken, now);
    if (!row || claim.changes !== 1) {
      throw new Error('CONSENT_REQUIRED: Review and confirm one exact transfer before sending data.');
    }
    return { request: ConsentPrepareRequestSchema.parse(JSON.parse(row.request_json)), endpoint: row.endpoint };
  }

  /** Closes the local token store after a one-shot sidecar operation. */
  public close(): void {
    this.database.close();
  }
}
