// Beschreibung: Erzwingt zugelassene Remote-Provider und einmalige, inhaltsfreie Consent-Quittungen.
// Artefakte:    US-000001; US-000007; ADR-000006
// Agent:        BE — 2026-08-12
import { createHash, randomUUID } from 'node:crypto';
import {
  CONTRACT_VERSION,
  ConsentPrepareRequestSchema,
  ConsentPreviewSchema,
  ConsentReceiptSchema,
  ProviderConfigurationSchema,
  ProviderHandshakeRequestSchema,
  ProviderHandshakeResponseSchema,
  type ConsentPreview,
  type ConsentReceipt,
  type ProviderConfiguration,
  type ProviderHandshakeResponse,
  type ProviderId
} from '@second-brain/contracts';

const CONSENT_TTL_MS = 5 * 60 * 1000;
const REQUIRED_SCOPES = ['read:notes', 'consent:once'] as const;

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
  execute(input: Readonly<{ provider: ProviderId; endpoint: string; payloadHash: string }>): Promise<void>;
}

/** Returns a credential-free provider record; endpoints are user-managed placeholders until configured. */
export function getApprovedProviderConfiguration(provider: ProviderId): ProviderConfiguration {
  return ProviderConfigurationSchema.parse(APPROVED_PROVIDERS[provider]);
}

interface PendingConsent {
  preview: ConsentPreview;
  sourceIds: string[];
}

/** Validates configuration and creates a non-network handshake result. */
export function inspectProviderConnection(
  input: unknown,
  configuration: ProviderConfiguration
): ProviderHandshakeResponse {
  const request = ProviderHandshakeRequestSchema.parse(input);
  const configured = ProviderConfigurationSchema.parse(configuration);
  const isExpected = request.provider === configured.provider && request.endpoint === configured.endpoint;
  return ProviderHandshakeResponseSchema.parse({
    contractVersion: CONTRACT_VERSION,
    provider: request.provider,
    endpoint: request.endpoint,
    connected: false,
    configured: isExpected,
    scopes: isExpected ? REQUIRED_SCOPES : [],
    message: isExpected
      ? 'Remote endpoint is configured. Complete the provider-managed connection test before use.'
      : 'The endpoint or approved provider scope does not match this configuration.'
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
      confirmationToken: token,
      expiresAt: new Date(this.now().getTime() + CONSENT_TTL_MS).toISOString()
    });
    this.pending.set(token, { preview, sourceIds: request.excerpts.map((excerpt) => excerpt.sourceId) });
    return preview;
  }

  /** Confirms exactly one unchanged preview and delegates only its hash to the provider port. */
  public async confirm(token: string, adapter: ProviderAdapter, endpoint: string): Promise<ConsentReceipt> {
    const pending = this.pending.get(token);
    if (!pending) throw new Error('CONSENT_REQUIRED: Prepare and confirm one exact transfer.');
    if (new Date(pending.preview.expiresAt).getTime() <= this.now().getTime()) {
      this.pending.delete(token);
      throw new Error('CONSENT_EXPIRED: Prepare a fresh transfer preview.');
    }
    await adapter.execute({ provider: pending.preview.provider, endpoint, payloadHash: pending.preview.payloadHash });
    const receipt = ConsentReceiptSchema.parse({
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
    this.pending.delete(token);
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
